# TODO - Jam Session MVP

## ✅ RESOLVED: API Key Security (Completed!)

### Solution Implemented: Environment Variables + Build Script ✅

We implemented **Option B** - environment variables with a build script:
- ✅ Created `.env` file for local API keys
- ✅ Created `.env.example` for documentation
- ✅ Created `.gitignore` to exclude `.env` and generated HTML files
- ✅ Created `host.template.html` and `play.template.html` with placeholders
- ✅ Created `build.py` script to generate HTML files from templates
- ✅ Updated README with build instructions

**How it works:**
1. Developers store API keys in `.env` (not committed)
2. Run `python3 build.py` to generate HTML files
3. Generated HTML files contain the API key but are gitignored
4. Only template files are committed to Git (safe to share)

### Original Options Considered

#### Option A: Template Files + .gitignore (Quick Fix - No Build Process)
- [ ] Create `host.template.html` (copy of host.html with placeholder key)
- [ ] Create `play.template.html` (copy of play.html with placeholder key)
- [ ] Create `.gitignore` file that excludes `host.html` and `play.html`
- [ ] Update README.md with setup instructions for copying templates
- [ ] Test that templates work correctly
- [ ] Verify .gitignore prevents committing real files

**Pros**: Simple, keeps "no build process" philosophy
**Cons**: Manual setup required for each developer/deployment

#### ✅ Option B: Environment Variables + Build Script (IMPLEMENTED)
- [x] Create `.env` file with `ABLY_API_KEY=your-key-here`
- [x] Add `.env` to `.gitignore`
- [x] Create build script (`build.py`) that:
  - [x] Reads environment variable from `.env` file
  - [x] Injects it into HTML files
  - [x] Generates `host.html` and `play.html`
- [x] Update template files to use placeholder `__ABLY_API_KEY__`
- [x] Update README with build/deploy instructions
- [ ] Configure hosting platform (Vercel/Netlify) to inject env vars during deployment (future)

**Pros**: Secure, works well with CI/CD, standard practice
**Cons**: Adds build step (but it's simple and fast)

#### ✅ Option C: Restrict Ably Key Permissions (Defense in Depth) - IMPLEMENTED
- [x] Log into Ably dashboard
- [x] Create a new restricted API key with:
  - [x] Only `subscribe` and `publish` capabilities (no admin, history, stats, etc.)
  - [x] Added to Vercel production environment variables
  - [x] Note: Limits potential damage from client-side key exposure
- [x] Keep root key for local development only

**Pros**: Additional security layer, easy to implement
**Cons**: Doesn't solve exposure problem, only mitigates damage
**Status**: ✅ Production uses restricted key; local dev uses root key for flexibility

#### Option D: Add Backend for Token Auth (Production-Ready)
- [ ] Research serverless options (Vercel Functions, Netlify Functions, AWS Lambda)
- [ ] Create token server endpoint that:
  - [ ] Stores Ably API key server-side as environment variable
  - [ ] Issues short-lived Ably tokens to clients
  - [ ] Validates requests (rate limiting, channel restrictions)
- [ ] Update `host.html` and `play.html` to:
  - [ ] Request token from backend on load
  - [ ] Use token instead of API key
  - [ ] Handle token refresh
- [ ] Deploy backend
- [ ] Test end-to-end flow
- [ ] Update deployment instructions

**Pros**: Most secure, production-ready, prevents key exposure entirely
**Cons**: Most complex, requires backend infrastructure

### Recommended Approach

**For MVP/Testing:**
- ✅ Implemented Option B (env vars + build script)
- ✅ Implemented Option C (restricted keys for production)
- Current setup: Vercel production uses restricted API key with limited capabilities

**For Future Production (Post-WebRTC):**
- Consider Option D (token server) for scaled production deployment
- This is the most secure solution for high-traffic public-facing apps
- May not be necessary for MVP/testing phase with restricted keys

### Decision Matrix

| Option | Security | Simplicity | Best For |
|--------|----------|------------|----------|
| A - Templates | Low | High | Local dev, private repos |
| B - Env Vars | Medium | Medium | Public repos, CI/CD deployments |
| C - Restricted Keys | Low | High | Additional layer only |
| D - Token Server | High | Low | Production apps |

### Notes
- If API key was already committed to Git history, must:
  - [ ] Revoke/regenerate key in Ably dashboard
  - [ ] Clean Git history OR start fresh repo
- Current key should be treated as compromised if pushed to public repo
- Consider if this app needs to be public at all (could use private repo initially)

---

## Recent Improvements (Completed)

### UI/UX Enhancements ✅
- [x] Added QR codes for easy phone joining (80x80px, scannable)
- [x] Added IP address override for localhost (orange warning box on host)
- [x] Added "End Session" button to stop sessions early
- [x] Optimized layout to fit everything on one screen (no scrolling)
- [x] Made all components more compact (smaller padding, tighter spacing)
- [x] Added beat indicators to phone controllers with time-based sync

### Musical Expressiveness Improvements ✅
- [x] Reduced quantization from 16th to 8th notes (drums only)
- [x] Removed quantization from bass for immediate, expressive play
- [x] Removed quantization from chords for immediate, expressive play
- [x] Added hold-to-sustain for bass (press and hold keys)
- [x] Added hold-to-sustain for chords (press and hold pads)
- [x] Added velocity sensitivity to drums (based on tap timing)
- [x] Expanded chords from 4 to 6 options (Am, F, C, G, Em, Dm)
- [x] Reduced bass button gaps for better touch targets (8px → 4px)

### Technical Improvements ✅
- [x] Implemented time-based beat synchronization (phones calculate beats locally - improved but still has drift issues)
- [x] Fixed chord release functionality (chords now properly decay)

### Bug Fixes ✅
- [x] Fixed visual metronome bug (now shows all 4 beats correctly)
- [x] Fixed beat indicator data attributes (0-3 indexing)
- [x] Fixed "Play Again" beat callback interference

---

## Feature Roadmap

### 🚀 Top Priority: WebRTC Migration

**Goal:** Migrate from Ably to WebRTC for <50ms latency (vs current 100-300ms)

**Status:** Planning Phase
**Documentation:** See `WEBRTC_ARCHITECTURE.md` for complete implementation plan

**Implementation Checklist:**
- [x] Document architecture and migration plan
- [x] Research scaling implications
- [ ] Build signaling server (Node.js + Socket.io) - *~1 day*
- [ ] Create proof of concept (minimal WebRTC demo) - *~1 day*
- [ ] Implement feature flag abstraction layer - *~1 day*
- [ ] Implement WebRTC adapters (host + player) - *~2-3 days*
- [ ] Deploy signaling server to Railway.app - *~1 hour*
- [ ] Integration testing (multiple devices/networks) - *~2-3 days*
- [ ] Measure and compare latency (Ably vs WebRTC) - *~1 day*
- [ ] Make go/no-go decision
- [ ] Remove deprecated implementation - *~1 day*

**Key Milestones:**
- **Days 1-2:** Planning & setup ✅ (current)
- **Day 3:** Signaling server + proof of concept
- **Day 4:** Feature flag abstraction
- **Days 5-7:** WebRTC integration (host & player)
- **Days 8-10:** Real-world testing & validation
- **Days 11-12:** Production rollout & decision
- **Day 13+:** Cleanup (if proceeding with WebRTC)

**Estimated Total Time:** ~2 weeks (with Claude Code assistance)

**Success Criteria:**
- Latency <50ms average
- Connection success >95%
- Beat sync drift <20ms
- User feedback: "significantly better"

**Fallback:** If WebRTC doesn't work (connection success <90%), fall back to self-hosted WebSocket server for better latency than Ably without WebRTC complexity.

### High Priority Features
- [x] ~~**Fix beat indicator synchronization**~~ - Superseded by WebRTC migration above
- [ ] Add tempo adjustment control on host screen (currently fixed at 120 BPM)
- [ ] Add session recording/playback capability
- [ ] Improve visualizer with more animations and effects

### New Instruments to Add
- [ ] Melody/lead synth (keyboard layout)
- [ ] Additional percussion (shakers, cowbell, toms)
- [ ] FX controller (filters, reverb, delays)
- [ ] Bass improvements (octave selector, different sound options, optional quantization toggle)
- [ ] Drum improvements (more realistic samples, kick variations, sequencer mode)

### UI/UX Improvements
- [ ] Add player avatars/names display on host screen
- [ ] Add ability to save and share jam sessions
- [ ] Better instrument control refinements
- [ ] Add visual feedback for which players are active

### Code Quality
- [ ] Add error handling for network failures
- [ ] Add reconnection logic for dropped connections
- [ ] Test on various mobile devices and browsers
- [ ] Add accessibility improvements
- [ ] Consider adding analytics (privacy-respecting)

### Documentation
- [x] Add troubleshooting section to README
- [x] Document QR code feature
- [x] Document IP address override feature
- [x] Document "End Session" button
- [ ] Document musical scale/chord choices in more detail
- [ ] Add video demo/GIF to README
- [ ] Create deployment guide for various platforms
- [ ] Add screenshots of host and player screens
