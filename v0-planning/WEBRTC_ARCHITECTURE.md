# WebRTC Architecture - Low Latency Migration Plan

**Goal:** Migrate from Ably to WebRTC to achieve <50ms latency for perfect beat synchronization and improved musical expressiveness.

**Status:** Planning Phase
**Target Latency:** <50ms (vs current 100-300ms with Ably)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current vs Proposed Architecture](#current-vs-proposed-architecture)
3. [Scaling Considerations](#scaling-considerations)
4. [Feature Flag Strategy](#feature-flag-strategy)
5. [Signaling Server Design](#signaling-server-design)
6. [Client Implementation](#client-implementation)
7. [Hosting & Deployment](#hosting--deployment)
8. [Development & Testing Workflow](#development--testing-workflow)
9. [Migration Path](#migration-path)
10. [Key Decisions & Trade-offs](#key-decisions--trade-offs)
11. [Success Metrics](#success-metrics)
12. [Open Questions](#open-questions)

---

## Executive Summary

### Problem
Current Ably-based architecture has 100-300ms latency, causing:
- Beat indicators drifting out of sync between host and phones
- Noticeable delay in musical timing
- Poor user experience for collaborative music-making

### Solution
Migrate to WebRTC peer-to-peer connections for direct host ↔ phone communication:
- Target: <50ms latency (20-50x improvement)
- Direct peer connections bypass cloud routing
- Keep Ably as fallback during migration (feature flag)

### Impact
- **Improved:** Perfect beat sync, musical expressiveness, user experience
- **Added Complexity:** Signaling server, NAT traversal, peer connection management
- **New Dependency:** Railway.app or similar for signaling server hosting
- **Cost:** $5-20/month (vs $29+/month for Ably)

---

## Current vs Proposed Architecture

### Current Architecture (Ably)

```
┌─────────────────────────────────────────────────────────────┐
│                     Ably Cloud (3rd party)                  │
│                      ~100-300ms latency                     │
└─────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    [Host Screen]        [Phone A]            [Phone B]
```

**Message Flow:**
1. Phone A presses drum pad
2. Message → Ably Cloud (50-150ms)
3. Ably → Host Screen (50-150ms)
4. **Total: 100-300ms**

**Beat Sync:**
- Host calculates beat, sends timestamp via Ably
- Phones receive message with delay
- Time-based calculation still drifts

**Pros:**
- Simple setup (no server required)
- Managed infrastructure
- Works everywhere (no NAT issues)

**Cons:**
- High latency (100-300ms)
- Costs money ($29+/month for production)
- No control over routing
- Beat sync drift issues

---

### Proposed Architecture (WebRTC)

```
┌──────────────────────────────────────────────────┐
│        Signaling Server (Railway.app)            │
│        Only for initial handshake                │
│        Node.js + Socket.io                       │
└──────────────────────────────────────────────────┘
         ▲                                   ▲
         │  (Step 1: Establish connection)  │
         │                                   │
    [Host Screen] ←──────────────────────→ [Phone A]
         │         Direct WebRTC             │
         │         ~10-50ms latency          │
         │                                   │
         └───────────────────────────────→ [Phone B]
                  Direct WebRTC
                  ~10-50ms latency
```

**Message Flow:**
1. Phone A presses drum pad
2. Message → Host Screen via WebRTC data channel (5-25ms)
3. **Total: 5-25ms** (10-20x faster!)

**Beat Sync:**
- Host sends beat messages directly to phones via WebRTC
- Minimal latency = perfect sync
- No drift

**Pros:**
- Very low latency (<50ms)
- Direct peer-to-peer connections
- Lower cost (only signaling server needed)
- Better user experience

**Cons:**
- More complex setup
- Need to host signaling server
- NAT traversal issues (need STUN/TURN)
- More moving parts to maintain

---

## Scaling Considerations

### Capacity Estimates

**Single Railway instance (basic $5/month plan):**

| Concurrent Rooms | Total Devices | Signaling Load | Status |
|------------------|---------------|----------------|---------|
| 10 | 50-70 | Negligible | ✅ Tiny load |
| 50 | 250-350 | ~20MB RAM | ✅ No problem |
| 100 | 500-700 | ~40MB RAM | ✅ Comfortable |
| 500 | 2,500-3,500 | ~200MB RAM | ✅ Still fine |
| 1,000 | 5,000-7,000 | ~400MB RAM | ⚠️ Getting full |

### Scaling Phases

**Phase 1: Prototype (<100 rooms)**
- Single Railway instance
- Free STUN/TURN
- Cost: ~$5-10/month
- **You are here**

**Phase 2: Small Production (100-500 rooms)**
- Upgraded Railway instance
- Monitor TURN bandwidth
- Cost: ~$20-50/month

**Phase 3: Medium Scale (500-1000 rooms)**
- Load balancing
- Multiple servers
- Redis for state
- Cost: ~$100-200/month

**Phase 4: Large Scale (1000+ rooms)**
- Multi-region deployment
- Dedicated TURN infrastructure
- Full DevOps
- Cost: $500+/month

### Key Bottlenecks

1. **Signaling Server:** WebSocket connections, room state management
2. **TURN Bandwidth:** Only if direct P2P fails (~10-20% of connections)
3. **Host Device:** Audio synthesis CPU (Tone.js)

**Good news:** Signaling server load is minimal after initial connection. WebRTC data goes peer-to-peer, not through server.

**Bottom line for prototype:** Zero scaling concerns until 100+ concurrent rooms.

---

## Feature Flag Strategy

### Goal
Allow switching between Ably (Implementation A) and WebRTC (Implementation B) without code changes.

### Implementation

#### Environment Variables
```bash
# .env
ABLY_API_KEY=xxxxx.yyyyy:zzzzzzzz
SIGNALING_SERVER_URL=https://jam-signaling.railway.app
COMMUNICATION_MODE=webrtc  # or 'ably'
```

#### Build-time Injection
```javascript
// In template files
const COMMUNICATION_MODE = '__COMMUNICATION_MODE__';  // Replaced by build.py
const ABLY_API_KEY = '__ABLY_API_KEY__';
const SIGNALING_SERVER_URL = '__SIGNALING_SERVER_URL__';
```

#### Adapter Pattern
```javascript
// Abstract communication layer
class CommunicationAdapter {
  static create(mode) {
    if (mode === 'webrtc') {
      return new WebRTCAdapter(SIGNALING_SERVER_URL);
    } else if (mode === 'ably') {
      return new AblyAdapter(ABLY_API_KEY);
    }
    throw new Error(`Unknown mode: ${mode}`);
  }
}

// Common interface
class CommunicationAdapter {
  async connect(roomCode, instrument) { /* ... */ }
  send(message) { /* ... */ }
  onMessage(callback) { /* ... */ }
  disconnect() { /* ... */ }
}
```

### A/B Testing Strategy
1. Deploy both implementations to production
2. 50% users on Ably, 50% on WebRTC
3. Compare metrics: latency, sync accuracy, connection success
4. Easy rollback if WebRTC has issues

---

## Signaling Server Design

### Purpose
WebRTC needs a signaling server to:
1. Help peers discover each other
2. Exchange connection information (SDP offers/answers)
3. Handle ICE candidate exchange (NAT traversal)

**Important:** Signaling server is ONLY used for setup. Once connected, all data flows peer-to-peer.

### Technology Stack

**Server:**
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **Why Socket.io:** Built-in rooms, reconnection, fallbacks

**Minimal Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.6.0"
  }
}
```

### Project Structure

```
signaling-server/
├── server.js           # Main server file
├── package.json        # Dependencies
├── Dockerfile          # For Railway deployment (optional)
├── README.md           # Setup instructions
└── .env.example        # Example config
```

### Core Functionality

#### 1. Room Management
```javascript
// Rooms map: { roomCode: { host: socketId, players: [socketId, ...] } }
const rooms = new Map();

socket.on('create-room', (roomCode) => {
  rooms.set(roomCode, { host: socket.id, players: [] });
  socket.join(roomCode);
  console.log(`Room ${roomCode} created by ${socket.id}`);
});

socket.on('join-room', ({ roomCode, role }) => {
  const room = rooms.get(roomCode);
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  socket.join(roomCode);

  if (role === 'host') {
    room.host = socket.id;
  } else {
    room.players.push(socket.id);
  }

  console.log(`${socket.id} joined room ${roomCode} as ${role}`);
});
```

#### 2. WebRTC Signaling (Offer/Answer/ICE)
```javascript
// Phone → Host: Send offer
socket.on('offer', ({ roomCode, offer }) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  io.to(room.host).emit('offer', {
    from: socket.id,
    offer: offer
  });
});

// Host → Phone: Send answer
socket.on('answer', ({ to, answer }) => {
  io.to(to).emit('answer', {
    from: socket.id,
    answer: answer
  });
});

// Exchange ICE candidates (both directions)
socket.on('ice-candidate', ({ to, candidate }) => {
  io.to(to).emit('ice-candidate', {
    from: socket.id,
    candidate: candidate
  });
});
```

#### 3. Connection Cleanup
```javascript
socket.on('disconnect', () => {
  console.log(`Socket ${socket.id} disconnected`);

  // Find and clean up rooms
  for (const [roomCode, room] of rooms.entries()) {
    if (room.host === socket.id) {
      // Host disconnected, notify players
      io.to(roomCode).emit('host-disconnected');
      rooms.delete(roomCode);
    } else {
      // Remove player from room
      room.players = room.players.filter(p => p !== socket.id);
    }
  }
});
```

### STUN/TURN Servers

**STUN (Session Traversal Utilities for NAT):**
- Helps peers discover their public IP
- Free public servers available
- Examples:
  - `stun:stun.l.google.com:19302`
  - `stun:stun1.l.google.com:19302`

**TURN (Traversal Using Relays around NAT):**
- Relays traffic when direct connection fails (~10-20% of connections)
- Needed for strict corporate firewalls
- Options:
  - **Free:** Twilio STUN/TURN (500GB/month free bandwidth)
  - **Self-hosted:** coturn server on Railway
  - **Paid:** Twilio ($0.05/GB), Cloudflare Calls

**ICE Server Configuration:**
```javascript
const iceServers = [
  // Free STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },

  // Twilio TURN (requires account)
  {
    urls: 'turn:global.turn.twilio.com:3478?transport=udp',
    username: 'your-twilio-username',
    credential: 'your-twilio-credential'
  }
];
```

---

## Client Implementation

### WebRTC Adapter Class

#### Host Side (host.template.html)
```javascript
class WebRTCAdapter {
  constructor(signalingServerUrl) {
    this.socket = io(signalingServerUrl);
    this.peers = new Map(); // Map<playerId, {connection, channel}>
    this.roomCode = null;
    this.messageCallback = null;
  }

  async connect(roomCode) {
    this.roomCode = roomCode;

    // Create room on signaling server
    this.socket.emit('create-room', roomCode);

    // Listen for offers from players
    this.socket.on('offer', async ({ from, offer }) => {
      console.log('[Host] Received offer from', from);
      await this.handleOffer(from, offer);
    });

    // Listen for ICE candidates
    this.socket.on('ice-candidate', ({ from, candidate }) => {
      const peer = this.peers.get(from);
      if (peer) {
        peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return true;
  }

  async handleOffer(peerId, offer) {
    // Create peer connection
    const connection = new RTCPeerConnection({ iceServers });

    // Handle data channel from player
    connection.ondatachannel = (event) => {
      const channel = event.channel;

      channel.onopen = () => {
        console.log('[Host] Data channel opened with', peerId);
      };

      channel.onmessage = (event) => {
        if (this.messageCallback) {
          this.messageCallback(JSON.parse(event.data));
        }
      };

      this.peers.set(peerId, { connection, channel });
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate
        });
      }
    };

    // Connection state monitoring
    connection.onconnectionstatechange = () => {
      console.log('[Host] Connection state with', peerId, ':', connection.connectionState);

      if (connection.connectionState === 'failed' ||
          connection.connectionState === 'disconnected') {
        this.peers.delete(peerId);
      }
    };

    // Set remote description and create answer
    await connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    // Send answer back to player
    this.socket.emit('answer', {
      to: peerId,
      answer: connection.localDescription
    });
  }

  send(message) {
    // Broadcast to all connected players
    let sentCount = 0;
    for (const { channel } of this.peers.values()) {
      if (channel && channel.readyState === 'open') {
        channel.send(JSON.stringify(message));
        sentCount++;
      }
    }
    console.log(`[Host] Broadcast message to ${sentCount} players`);
  }

  onMessage(callback) {
    this.messageCallback = callback;
  }

  disconnect() {
    // Close all peer connections
    for (const { connection, channel } of this.peers.values()) {
      if (channel) channel.close();
      if (connection) connection.close();
    }
    this.peers.clear();

    // Disconnect from signaling server
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

#### Player Side (play.template.html)
```javascript
class WebRTCAdapter {
  constructor(signalingServerUrl) {
    this.socket = io(signalingServerUrl);
    this.connection = null;
    this.channel = null;
    this.messageCallback = null;
  }

  async connect(roomCode, instrument) {
    // Join room on signaling server
    this.socket.emit('join-room', { roomCode, role: 'player' });

    // Create peer connection
    this.connection = new RTCPeerConnection({ iceServers });

    // Create data channel
    this.channel = this.connection.createDataChannel('game');

    this.channel.onopen = () => {
      console.log('[Player] Data channel opened');
      // Send join message
      this.send({ type: 'join', instrument, name: 'Player' });
    };

    this.channel.onmessage = (event) => {
      if (this.messageCallback) {
        this.messageCallback(JSON.parse(event.data));
      }
    };

    // Handle ICE candidates
    this.connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          to: 'host',
          candidate: event.candidate
        });
      }
    };

    // Connection state monitoring
    this.connection.onconnectionstatechange = () => {
      console.log('[Player] Connection state:', this.connection.connectionState);

      switch (this.connection.connectionState) {
        case 'connected':
          // Show "Connected" UI
          break;
        case 'disconnected':
        case 'failed':
          // Show "Reconnecting..." or error
          break;
        case 'closed':
          // Connection ended
          break;
      }
    };

    // Create and send offer
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);

    this.socket.emit('offer', {
      roomCode,
      offer: this.connection.localDescription
    });

    // Wait for answer from host
    this.socket.on('answer', async ({ answer }) => {
      console.log('[Player] Received answer from host');
      await this.connection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidates from host
    this.socket.on('ice-candidate', ({ candidate }) => {
      this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return true;
  }

  send(message) {
    if (this.channel && this.channel.readyState === 'open') {
      this.channel.send(JSON.stringify(message));
    } else {
      console.warn('[Player] Cannot send, channel not open');
    }
  }

  onMessage(callback) {
    this.messageCallback = callback;
  }

  disconnect() {
    if (this.channel) this.channel.close();
    if (this.connection) this.connection.close();
    if (this.socket) this.socket.disconnect();
  }
}
```

### Ably Adapter (Wrapper for existing code)

```javascript
class AblyAdapter {
  constructor(apiKey) {
    this.ably = new Ably.Realtime({ key: apiKey });
    this.channel = null;
    this.messageCallback = null;
  }

  async connect(roomCode, instrument) {
    this.channel = this.ably.channels.get(`jam-${roomCode}`);

    // Listen for messages
    this.channel.subscribe('player', (message) => {
      if (this.messageCallback) {
        this.messageCallback(message.data);
      }
    });

    this.channel.subscribe('host', (message) => {
      if (this.messageCallback) {
        this.messageCallback(message.data);
      }
    });

    this.channel.subscribe('session', (message) => {
      if (this.messageCallback) {
        this.messageCallback(message.data);
      }
    });

    return true;
  }

  send(message) {
    if (this.channel) {
      const topic = message.type === 'beat' ? 'host' :
                    message.type === 'session' ? 'session' : 'player';
      this.channel.publish(topic, message);
    }
  }

  onMessage(callback) {
    this.messageCallback = callback;
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
    }
    if (this.ably) {
      this.ably.close();
    }
  }
}
```

---

## Hosting & Deployment

### Signaling Server: Railway.app

**Why Railway:**
- WebSocket support out of the box
- Simple git-based deployment
- Affordable ($5-10/month)
- Automatic SSL certificates
- Good for Node.js apps

**Deployment Steps:**

1. **Create signaling server repository:**
   ```bash
   mkdir signaling-server
   cd signaling-server
   git init
   # Add server.js, package.json
   git add .
   git commit -m "Initial signaling server"
   ```

2. **Deploy to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

3. **Railway will provide URL:**
   ```
   https://jam-signaling-production.up.railway.app
   ```

4. **Add to .env:**
   ```bash
   SIGNALING_SERVER_URL=https://jam-signaling-production.up.railway.app
   ```

**Alternative: Render.com**
- Similar to Railway
- Also supports WebSockets
- Free tier available (spins down when idle - not ideal for this use case)

### Static Files: Keep on Vercel

**No changes needed:**
- Vercel continues to host `host.html` and `play.html`
- These files connect to signaling server on Railway
- CDN benefits remain

**Build process:**
```bash
# Set environment variables in .env
COMMUNICATION_MODE=webrtc
SIGNALING_SERVER_URL=https://jam-signaling-production.up.railway.app

# Generate HTML files
python3 build.py

# Deploy to Vercel
vercel deploy
```

### Cost Comparison

| Service | Current (Ably) | Proposed (WebRTC) |
|---------|----------------|-------------------|
| Ably | $29/month (Starter) | $0 (not used) |
| Signaling Server | $0 | $5-10/month (Railway) |
| Static Hosting | $0 (Vercel free) | $0 (Vercel free) |
| STUN | N/A | $0 (Google free) |
| TURN | N/A | $0 (Twilio free tier) or $10-20/month |
| **Total** | **$29/month** | **$5-20/month** |

**Savings:** ~$10-25/month

---

## Development & Testing Workflow

### Local Development Setup

#### Option 1: Run Everything Locally (Recommended for Development)

**Terminal 1: Signaling Server**
```bash
cd signaling-server
npm install
node server.js
# Runs on http://localhost:3000
```

**Terminal 2: Build & Serve**
```bash
# .env
COMMUNICATION_MODE=webrtc
SIGNALING_SERVER_URL=http://localhost:3000

python3 build.py
python3 -m http.server 8000
```

**Testing:**
1. Open `http://localhost:8000/host.html`
2. Open `http://localhost:8000/play.html?room=XXXX&instrument=drums`
3. Both connect to `localhost:3000` signaling server
4. WebRTC establishes local peer connection

**Pros:**
- Fast iteration
- Full debugging control
- No internet required
- Works on same machine

**Cons:**
- Can't easily test from real phones (need same network + computer IP)

---

#### Option 2: Deployed Signaling + ngrok (Best for Phone Testing)

**Terminal 1: HTTP Server**
```bash
python3 -m http.server 8000
```

**Terminal 2: ngrok**
```bash
ngrok http 8000
# Get URL: https://abc123.ngrok.io
```

**Configuration:**
```bash
# .env
COMMUNICATION_MODE=webrtc
SIGNALING_SERVER_URL=https://jam-signaling-production.up.railway.app  # Deployed
```

**Testing:**
1. Open `https://abc123.ngrok.io/host.html` on laptop
2. Open `https://abc123.ngrok.io/play.html?...` on phone
3. Both connect to deployed signaling server on Railway
4. WebRTC establishes peer connection across devices

**Pros:**
- Test on real phones
- Real network conditions
- Real-world WebRTC behavior

**Cons:**
- Requires deployed signaling server
- Slightly slower iteration

---

### Testing Ably vs WebRTC

**Switch modes by changing .env:**

```bash
# Test with Ably
COMMUNICATION_MODE=ably
ABLY_API_KEY=xxxxx.yyyyy:zzzzzzzz

python3 build.py
# Test...

# Test with WebRTC
COMMUNICATION_MODE=webrtc
SIGNALING_SERVER_URL=https://jam-signaling-production.up.railway.app

python3 build.py
# Test...
```

**Side-by-side comparison:**
1. Measure latency (timestamp messages)
2. Observe beat sync drift
3. Note connection reliability
4. Gather user feedback

---

### Debug Tools

**Chrome DevTools:**
```
chrome://webrtc-internals/
```
- Shows all active WebRTC connections
- ICE candidate exchange
- Connection statistics (bitrate, packet loss, latency)
- Debug failed connections

**Console Logging:**
```javascript
// In WebRTC adapter
console.log('[WebRTC] Connection state:', peer.connectionState);
console.log('[WebRTC] ICE state:', peer.iceConnectionState);
console.log('[WebRTC] Signaling state:', peer.signalingState);

// Log data channel messages
channel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('[WebRTC] Received:', data.type, data);
};
```

**Latency Measurement:**
```javascript
// On player side, timestamp outgoing messages
const message = {
  type: 'drums',
  note: 'kick',
  timestamp: Date.now()
};
adapter.send(message);

// On host side, calculate latency
adapter.onMessage((data) => {
  if (data.timestamp) {
    const latency = Date.now() - data.timestamp;
    console.log(`Latency: ${latency}ms`);
  }
});
```

---

## Migration Path

**Estimated Timeline:** ~2 weeks with Claude Code assistance

### Day 1-2: Planning & Setup ✅
- [x] Document architecture (this file)
- [x] Update TODO.md and CLAUDE.md
- [x] Research scaling implications
- [ ] Set up signaling server repository
- [ ] Deploy minimal signaling server to Railway

### Day 3: Proof of Concept
- [ ] Create minimal WebRTC demo (separate from main app)
- [ ] Establish peer connection between two browsers
- [ ] Send test messages over data channel
- [ ] Measure latency vs Ably
- [ ] Validate approach works

### Day 4: Feature Flag Implementation
- [ ] Create `CommunicationAdapter` abstraction
- [ ] Implement `AblyAdapter` (wrap existing code)
- [ ] Implement basic `WebRTCAdapter` shell
- [ ] Add `COMMUNICATION_MODE` env var to build.py
- [ ] Test both modes initialize correctly

### Days 5-7: WebRTC Integration
- [ ] Complete WebRTCAdapter for host.template.html
- [ ] Complete WebRTCAdapter for play.template.html
- [ ] Replace direct Ably calls with adapter.send()
- [ ] Test all instrument messages work over WebRTC
- [ ] Test beat sync over WebRTC
- [ ] Test session start/end over WebRTC
- [ ] Add error handling and reconnection logic

### Day 8: Production Signaling Server
- [ ] Add logging and monitoring to signaling server
- [ ] Configure TURN servers (Twilio free tier)
- [ ] Deploy production version to Railway
- [ ] Test with deployed signaling server

### Days 9-10: Real-World Testing & Validation
- [ ] Test on various devices (iOS, Android, laptops)
- [ ] Test on different networks (WiFi, cellular, corporate)
- [ ] Measure latency improvements (vs Ably baseline)
- [ ] Test NAT traversal success rate
- [ ] Compare user experience (Ably vs WebRTC)
- [ ] Document any issues or edge cases

### Days 11-12: Decision & Rollout
- [ ] Review success metrics (latency, connection success, UX)
- [ ] Make go/no-go decision: WebRTC or stick with Ably?
- [ ] If GO: Deploy to production, monitor closely
- [ ] If NO-GO: Document learnings, consider WebSocket fallback

### Day 13+: Cleanup (if proceeding with WebRTC)
- [ ] Remove Ably implementation (if WebRTC successful)
- [ ] Simplify codebase (remove abstraction if not needed)
- [ ] Update all documentation
- [ ] Archive Ably credentials

---

## Key Decisions & Trade-offs

### Decision 1: Host as Hub vs Mesh Network

**Option A: Host as Hub** ⭐ **Recommended**
```
Phones connect only to Host
Host broadcasts to all phones
```
**Pros:**
- Simpler: N connections (N = number of phones)
- Host controls everything (beat sync, game state)
- Natural for this app (host is already central authority)

**Cons:**
- Host's connection quality affects everyone

**Option B: Full Mesh**
```
Every device connects to every other device
```
**Pros:**
- More resilient (no single point of failure)

**Cons:**
- Complex: N² connections (expensive for many players)
- Overkill for this use case
- Who controls beat sync?

**Decision:** Use Option A (Host as Hub)

---

### Decision 2: Signaling Protocol

**Option A: Socket.io** ⭐ **Recommended**

**Pros:**
- Rooms built-in
- Automatic reconnection
- Easy to use
- Fallback transports (polling if WebSocket blocked)

**Cons:**
- Slightly larger library (~60KB)

**Option B: Raw WebSockets**

**Pros:**
- Lighter weight (~10KB)

**Cons:**
- Have to implement rooms, reconnection manually
- More code to maintain

**Decision:** Use Socket.io for developer experience

---

### Decision 3: TURN Server Strategy

**Option A: Free Tier Only** ⭐ **Start Here**
- Use Twilio free TURN servers (500GB/month)
- Acceptable for MVP/prototype
- Some users (~5-10%) may fail to connect behind strict firewalls

**Option B: Paid TURN**
- Reliable for all users
- Costs ~$10-20/month
- Better UX

**Decision:** Start with Option A, upgrade to Option B if connection success rate <95%

---

### Decision 4: Keep Ably Long-term?

**Option A: Remove Ably Entirely** ⭐ **Likely**

**Pros:**
- Simpler codebase
- Lower cost
- No abstraction overhead

**Cons:**
- No fallback if WebRTC fails

**Option B: Keep Both with Feature Flag**

**Pros:**
- Fallback for users with NAT issues
- Can A/B test long-term

**Cons:**
- Maintain two implementations
- Code complexity

**Decision:** TBD after testing. If WebRTC works well (>95% success rate), remove Ably.

---

### Decision 5: WebRTC Library vs Native API

**Option A: Native WebRTC API** ⭐ **Recommended**

**Pros:**
- No dependencies
- Full control
- Smaller bundle size

**Cons:**
- More verbose code
- Handle edge cases manually

**Option B: simple-peer Library**

**Pros:**
- Simpler API
- Handles edge cases

**Cons:**
- Additional dependency (~25KB)
- Less control

**Decision:** Use native API for learning and control. Can wrap in helper functions.

---

## Success Metrics

### Quantitative Metrics

**Latency:**
- **Target:** <50ms average round-trip time
- **Current (Ably):** 100-300ms
- **Measurement:** Timestamp messages, measure arrival time

**Connection Success Rate:**
- **Target:** >95% of users successfully connect
- **Current (Ably):** ~100% (cloud service)
- **Measurement:** Track connection attempts vs successes

**Beat Sync Accuracy:**
- **Target:** <20ms drift between host and phones
- **Current:** 50-200ms drift
- **Measurement:** Compare beat timestamps across devices

**NAT Traversal:**
- **Target:** >90% direct peer connections (no TURN relay)
- **Measurement:** Track ICE connection types (host/srflx/relay)

**TURN Bandwidth:**
- **Monitor:** Monthly bandwidth usage
- **Target:** Stay under 500GB/month free tier
- **Measurement:** Railway/Twilio dashboards

---

### Qualitative Metrics

**User Experience:**
- Does beat sync feel "perfectly in sync"?
- Do instruments feel more responsive?
- Is the jam session more fun?
- Are there connection issues?

**Developer Experience:**
- Is WebRTC too complex to maintain?
- Are bugs manageable?
- Is deployment straightforward?
- Is debugging acceptable?

---

### Go/No-Go Criteria

**✅ GO (proceed with WebRTC):**
- ✅ Latency <50ms average
- ✅ Connection success >95%
- ✅ Beat sync drift <20ms
- ✅ User feedback: "significantly better"
- ✅ Manageable complexity
- ✅ Development time <2 months

**❌ NO-GO (revert to Ably or try WebSocket fallback):**
- ❌ Connection success <90%
- ❌ Too many NAT traversal issues
- ❌ Development time >2 months
- ❌ Too complex to maintain
- ❌ Latency not significantly improved
- ❌ More bugs than benefits

---

### Fallback Plan

**If WebRTC doesn't work out:**

**Option: Self-hosted WebSocket server**
- Still 5-10x better latency than Ably (20-50ms vs 100-300ms)
- Much simpler than WebRTC
- Same hosting (Railway.app)
- Lose peer-to-peer benefits but keep low latency

**When to use fallback:**
- WebRTC connection success rate <90%
- Too many bugs/edge cases
- Development time exceeds 2 months
- NAT traversal too unreliable

---

## Open Questions

### 1. How many players per session?
**Current assumption:** 3-6 players
**Impact:** Affects connection count and bandwidth
**Answer:** Start with 6 max, can increase if needed

### 2. What's acceptable connection success rate?
**Options:** 95%? 98%? 99%?
**Impact:** Determines if we need paid TURN servers
**Answer:** TBD after testing, target >95%

### 3. Should we support session recording/playback?
**Impact:** Need to log all WebRTC messages
**Answer:** Not for MVP, can add later

### 4. What browsers/devices must we support?
**WebRTC support:** All modern browsers (Chrome, Firefox, Safari, Edge)
**Concern:** iOS Safari has some WebRTC quirks
**Answer:** Test on iOS/Android/desktop during validation phase

### 5. What's the budget for hosting?
**Options:**
- Free tier only: $5/month (Twilio limits apply)
- Small budget: <$20/month (some paid TURN)
- Medium budget: <$50/month (reliable TURN, monitoring)
**Answer:** Start with $5/month, upgrade as needed

### 6. How long to keep Ably as fallback?
**Options:**
- Remove immediately after WebRTC works
- Keep for 1 month
- Keep indefinitely
**Answer:** TBD, likely remove after 1 month of successful WebRTC usage

---

## References

**WebRTC:**
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC for the Curious](https://webrtcforthecurious.com/)
- [Getting Started with WebRTC](https://web.dev/webrtc-basics/)

**Libraries:**
- [simple-peer](https://github.com/feross/simple-peer) - Simplified WebRTC wrapper
- [Socket.io](https://socket.io/docs/v4/) - WebSocket library for signaling

**Hosting:**
- [Railway.app Docs](https://docs.railway.app/)
- [Railway WebSocket Guide](https://docs.railway.app/guides/deploy-websockets)

**STUN/TURN:**
- [Google STUN Servers](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b)
- [Twilio STUN/TURN](https://www.twilio.com/docs/stun-turn)
- [coturn](https://github.com/coturn/coturn) - Open source TURN server

**Debugging:**
- [chrome://webrtc-internals](chrome://webrtc-internals/) - Chrome WebRTC debugging
- [WebRTC Troubleshooter](https://test.webrtc.org/) - Connection testing tool

---

**Document Version:** 1.0
**Last Updated:** 2025-12-16
**Status:** Planning Phase
**Next Review:** After proof of concept (Phase 2)

**Authors:** Josh Kinberg + Claude Code
