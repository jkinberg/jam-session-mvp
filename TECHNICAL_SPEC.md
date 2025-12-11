# Jam Session MVP — Technical Specification

## Overview

Jam Session is a multiplayer music party game where players use their phones as virtual instruments while a shared screen (TV/laptop) displays a visualizer and plays all audio. The experience is designed to make non-musicians sound good together through automatic quantization and constrained musical scales.

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HOST DEVICE                                     │
│                         (TV, Laptop, or Desktop)                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                           host.html                                     │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │ │
│  │  │   Tone.js   │  │    Ably     │  │  Visualizer │  │    Timer     │  │ │
│  │  │   Audio     │  │  Listener   │  │   (CSS)     │  │   Manager    │  │ │
│  │  │   Engine    │  │             │  │             │  │              │  │ │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └──────────────┘  │ │
│  │         │                │                                             │ │
│  │         │    ┌───────────┴───────────┐                                │ │
│  │         │    │  Message Router       │                                │ │
│  │         │    │  - drums → playDrum() │                                │ │
│  │         │    │  - bass → playBass()  │                                │ │
│  │         │    │  - chords → playChord()                                │ │
│  │         │    └───────────────────────┘                                │ │
│  │         │                                                              │ │
│  │         ▼                                                              │ │
│  │  ┌─────────────────────────────────────┐                              │ │
│  │  │           Audio Output              │                              │ │
│  │  │  (Speakers / TV Audio)              │                              │ │
│  │  └─────────────────────────────────────┘                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Ably WebSocket
                                    │ Channel: jam-{ROOM_CODE}
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│      PHONE 1        │ │      PHONE 2        │ │      PHONE 3        │
│    play.html        │ │    play.html        │ │    play.html        │
│  ?instrument=drums  │ │  ?instrument=bass   │ │  ?instrument=chords │
│                     │ │                     │ │                     │
│  ┌───────────────┐  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│  │  Drum Pads    │  │ │  │  Bass Keys    │  │ │  │  Chord Pads   │  │
│  │  ┌────┬────┐  │  │ │  │ ┌─┬─┬─┬─┬─┬─┐ │  │ │  │  ┌────┬────┐  │  │
│  │  │KICK│SNRE│  │  │ │  │ │C│D│E│F│G│A│B│  │ │  │  │ Am │ F  │  │  │
│  │  ├────┼────┤  │  │ │  │ └─┴─┴─┴─┴─┴─┘ │  │ │  │  ├────┼────┤  │  │
│  │  │HAT │CLAP│  │  │ │  └───────────────┘  │ │  │  │ C  │ G  │  │  │
│  │  └────┴────┘  │  │ │                     │ │  │  └────┴────┘  │  │
│  └───────────────┘  │ └─────────────────────┘ │  └───────────────┘  │
│                     │                         │                     │
│  Sends:             │  Sends:                 │  Sends:             │
│  {type:'drums',     │  {type:'bass',          │  {type:'chords',    │
│   note:'kick'}      │   note:'C'}             │   chord:'Am'}       │
└─────────────────────┘ └─────────────────────────┘ └─────────────────────┘
```

### Key Design Decisions

1. **Centralized Audio**: All sound plays on the host device. Phones send control messages only. This eliminates audio sync issues between devices.

2. **Quantization**: All notes are scheduled to the next 16th note subdivision, making everything sound "tight" regardless of player timing.

3. **Constrained Musicality**: Bass notes map to a minor pentatonic scale; chords are a standard pop progression. This makes it hard to sound bad.

4. **URL-Based Instrument Assignment**: No complex lobby UI. The instrument is determined by URL parameter, and the host displays join URLs for each instrument.

---

## File Structure

```
jam-mvp/
├── host.html          # Shared screen - audio engine & visualizer
├── play.html          # Phone controller - adapts to instrument param
├── README.md          # User-facing setup guide
└── TECHNICAL_SPEC.md  # This document
```

### Why Single-File HTML?

For MVP simplicity:
- No build process required
- Easy to edit and test
- Can be hosted on any static file server
- All dependencies loaded from CDN

---

## Dependencies

| Dependency | Version | CDN URL | Purpose |
|------------|---------|---------|---------|
| **Tone.js** | 14.8.49 | `https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js` | Audio synthesis, scheduling, transport |
| **Ably** | 1.x | `https://cdn.ably.com/lib/ably.min-1.js` | Real-time WebSocket messaging |

No other dependencies. No npm, no bundler, no framework.

---

## Host Page (`host.html`)

### Configuration Constants

```javascript
const ABLY_API_KEY = 'YOUR_ABLY_API_KEY_HERE';  // Must be replaced
const SESSION_DURATION = 180;                    // 3 minutes in seconds
const BPM = 120;                                 // Tempo
const QUANTIZE_SUBDIVISION = '16n';              // Quantize to 16th notes
```

### State Variables

```javascript
let roomCode = '';           // 4-character room code (e.g., 'JAM4')
let channel = null;          // Ably channel reference
let isPlaying = false;       // Whether session is active
let timeRemaining = 180;     // Countdown timer
let timerInterval = null;    // setInterval reference
let currentBeat = 0;         // Current beat (0-3)
let totalNotes = 0;          // Stats counter

const players = {
    drums:  { connected: false, name: null },
    bass:   { connected: false, name: null },
    chords: { connected: false, name: null }
};
```

### Audio Engine (Tone.js)

#### Drum Synths

| Sound | Tone.js Class | Key Parameters |
|-------|---------------|----------------|
| Kick | `MembraneSynth` | `pitchDecay: 0.05`, `octaves: 6` |
| Snare | `NoiseSynth` | `noise.type: 'white'`, `decay: 0.2` |
| Hi-Hat | `MetalSynth` | `frequency: 400`, `harmonicity: 5.1` |
| Clap | `NoiseSynth` | `noise.type: 'pink'`, `decay: 0.1` |

#### Bass Synth

```javascript
const bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 2, type: 'lowpass', rolloff: -24 },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 },
    filterEnvelope: { 
        attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8, 
        baseFrequency: 100, octaves: 2.5 
    }
});
```

#### Chord Synth

```javascript
const chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1 }
});
```

### Musical Mappings

#### Bass Notes (C Minor Pentatonic)

```javascript
const bassNotes = {
    'C': 'C2',
    'D': 'D2',
    'E': 'Eb2',  // Flat for minor
    'F': 'F2',
    'G': 'G2',
    'A': 'Ab2',  // Flat for minor
    'B': 'Bb2'   // Flat for minor
};
```

#### Chord Voicings

```javascript
const chordNotes = {
    'Am': ['A2', 'C3', 'E3'],
    'F':  ['F2', 'A2', 'C3'],
    'C':  ['C2', 'E2', 'G2'],
    'G':  ['G2', 'B2', 'D3']
};
```

### Key Functions

#### `playDrum(note)`
Schedules a drum hit at the next 16th note.

```javascript
function playDrum(note) {
    const time = Tone.Transport.nextSubdivision(QUANTIZE_SUBDIVISION);
    switch(note) {
        case 'kick':
            drumSynths.kick.triggerAttackRelease('C1', '8n', time);
            break;
        // ... other cases
    }
    showActivity('drums');
    totalNotes++;
}
```

#### `playBass(note)`
Plays a bass note, mapped through the pentatonic scale.

#### `playChord(chord)`
Plays a 3-note chord using PolySynth.

#### `setupAbly()`
Initializes Ably connection and message handlers.

```javascript
channel.subscribe('player', (message) => {
    const data = message.data;
    switch(data.type) {
        case 'join':
            updatePlayerStatus(data.instrument, true, data.name);
            break;
        case 'drums':
            if (isPlaying) playDrum(data.note);
            break;
        case 'bass':
            if (isPlaying) playBass(data.note);
            break;
        case 'chords':
            if (isPlaying) playChord(data.chord);
            break;
    }
});
```

### UI Elements

| Element ID | Purpose |
|------------|---------|
| `startOverlay` | Initial screen with "START HOST" button |
| `endOverlay` | Session complete screen with stats |
| `roomCode` | Displays the 4-character room code |
| `timer` | Countdown display (MM:SS format) |
| `card-drums`, `card-bass`, `card-chords` | Player connection status cards |
| `joinUrls` | Container for instrument join URLs |

---

## Player Page (`play.html`)

### URL Parameters

| Parameter | Required | Example | Purpose |
|-----------|----------|---------|---------|
| `room` | No* | `JAM4` | Room code to join |
| `instrument` | No* | `drums` | Which instrument to display |
| `name` | No | `Alex` | Player display name |

*If not provided, user is prompted to enter/select.

### Flow States

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Join Screen │────▶│ Instrument Select│────▶│ Waiting Screen  │
│ (enter code)│     │ (pick drums/bass │     │ (connected,     │
└─────────────┘     │  /chords)        │     │  waiting start) │
                    └──────────────────┘     └────────┬────────┘
                                                      │
                                                      ▼
┌─────────────┐                              ┌─────────────────┐
│ Ended Screen│◀─────────────────────────────│ Main Controller │
│ (stats,     │      session ends            │ (instrument UI) │
│  play again)│                              └─────────────────┘
└─────────────┘
```

### Instrument Configurations

Each instrument is defined in the `instrumentConfigs` object:

```javascript
const instrumentConfigs = {
    drums: {
        emoji: '🥁',
        name: 'Drums',
        render: () => `...HTML template...`,
        setup: (sendFn) => { /* attach event listeners */ }
    },
    bass: { /* ... */ },
    chords: { /* ... */ }
};
```

### Message Types Sent

| Message | When | Payload |
|---------|------|---------|
| Join | On connection | `{ type: 'join', instrument: 'drums', name: 'Alex' }` |
| Drum hit | On pad tap | `{ type: 'drums', note: 'kick' }` |
| Bass note | On key tap | `{ type: 'bass', note: 'C' }` |
| Chord | On pad tap | `{ type: 'chords', chord: 'Am' }` |

### Message Types Received

| Message | From | Action |
|---------|------|--------|
| `{ type: 'beat', beat: 0-3 }` | Host | Update beat indicator |
| `{ type: 'session', status: 'playing' }` | Host | Show main UI |
| `{ type: 'session', status: 'ended' }` | Host | Show end screen |

---

## Ably Channel Structure

### Channel Name
```
jam-{ROOM_CODE}
```
Example: `jam-JAM4`

### Message Topics

| Topic | Publisher | Subscriber | Purpose |
|-------|-----------|------------|---------|
| `player` | Phones | Host | Instrument notes, join/leave |
| `host` | Host | Phones | Beat sync |
| `session` | Host | Phones | Session state (playing/ended) |

---

## Timing & Quantization

### Transport Setup

```javascript
Tone.Transport.bpm.value = 120;

// Beat callback runs every quarter note
Tone.Transport.scheduleRepeat((time) => {
    currentBeat = (currentBeat + 1) % 4;
    // Broadcast to players
    channel.publish('host', { type: 'beat', beat: currentBeat });
}, '4n');

Tone.Transport.start();
```

### Quantization Method

All `play*()` functions use:
```javascript
const time = Tone.Transport.nextSubdivision('16n');
synth.triggerAttackRelease(note, duration, time);
```

This schedules the sound at the next 16th note boundary, not immediately. The maximum latency added is ~125ms at 120 BPM (one 16th note = 60/120/4 = 0.125 seconds).

---

## CSS Architecture

Both files use inline `<style>` tags for simplicity. Key design patterns:

### Host Page
- Dark gradient background (`#1a1a2e` to `#16213e`)
- Flexbox layout with centered visualizer
- CSS animations for pulse effects
- Responsive instrument cards

### Player Page
- Full-height instrument controllers
- Large touch targets (minimum ~80px)
- Active states with `transform: scale(0.95)` and `brightness(1.3)`
- Beat indicator synced with host

---

## Known Limitations

1. **Latency**: Ably adds ~50-150ms network latency. Quantization masks this but true real-time feel requires WebRTC.

2. **Single Room Per Tab**: Each browser tab can only be in one room. No spectator mode.

3. **No Persistence**: Room codes are ephemeral. Refreshing host page creates new room.

4. **No Audio on Phones**: By design. Some users might expect to hear their own sounds.

5. **Fixed Tempo/Key**: No way to change BPM or musical key during session.

6. **No MIDI Support**: Cannot connect hardware MIDI controllers.

---

## Extension Points

### Adding a New Instrument

1. **In `host.html`**:
   - Add a new synth to the audio engine
   - Add a new `play[Instrument]()` function
   - Add case to the message router switch statement
   - Add player card UI element

2. **In `play.html`**:
   - Add new entry to `instrumentConfigs` object with `render()` and `setup()` functions

### Adding Sound Packs/Themes

1. Create alternate note mappings (e.g., major scale instead of minor)
2. Create alternate synth configurations
3. Add theme selector to host setup phase

### Adding Recording/Playback

1. Store messages with timestamps in an array
2. On session end, serialize to JSON
3. Playback by re-dispatching messages through the audio engine

---

## Testing Checklist

### Local Solo Test
- [ ] Host page loads without errors
- [ ] Room code is generated and displayed
- [ ] "START HOST" button initializes audio
- [ ] Beat indicator cycles 1-2-3-4
- [ ] Player page connects with room code
- [ ] Instrument UI matches URL parameter
- [ ] Tapping sends messages (check console)
- [ ] Host receives messages and plays sounds
- [ ] Timer counts down
- [ ] Session end screen appears at 0:00

### Multi-Device Test
- [ ] Multiple phones can connect simultaneously
- [ ] Each phone shows different instrument
- [ ] All sounds play on host (not phones)
- [ ] Beat indicators are roughly synced
- [ ] Player disconnect is handled gracefully

---

## Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **Local (python server)** | Fastest to test | Only works on local network |
| **ngrok** | Quick public URL | Temporary, requires running locally |
| **Vercel/Netlify** | Free, permanent URL | Need GitHub repo |
| **GitHub Pages** | Free, easy | No server-side (but not needed here) |

---

## Future Considerations

### If Latency is a Problem
- Migrate to WebRTC using Phone Party framework
- Or implement client-side audio with sync protocol

### If Scale is Needed
- Ably free tier: 6M messages/month
- Consider self-hosted WebSocket server for cost

### If Mobile Experience Needs Improvement
- Consider React Native or PWA for better touch handling
- Add offline capability with service workers
