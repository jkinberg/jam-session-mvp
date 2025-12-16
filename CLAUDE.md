# CLAUDE.md — Instructions for AI Assistants

This file provides context for Claude Code, Cursor, and other AI coding assistants working on this project.

---

## Project Summary

**Jam Session** is a multiplayer music party game MVP. Players join via phones, tap virtual instruments, and all audio plays on a shared TV screen. The goal is to test whether collaborative music-making is fun before building a more complex product.

**Key constraint**: This is intentionally minimal. Resist the urge to add complexity, frameworks, or dependencies unless specifically requested.

**⚠️ Important:** If working on latency, synchronization, or WebRTC features, **read `WEBRTC_ARCHITECTURE.md` first**. It contains the complete migration plan from Ably to WebRTC for <50ms latency.

---

## Quick Context

```
HOST (TV/laptop)                    PHONES (controllers)
┌─────────────────┐                 ┌─────────────────┐
│  host.html      │◄── Ably ───────│  play.html      │
│  - Tone.js audio│    WebSocket   │  - Drum pads    │
│  - Visualizer   │                │  - Bass keys    │
│  - Beat sync    │                │  - Chord pads   │
└─────────────────┘                └─────────────────┘
```

- **All audio plays on host**, not on phones
- **Quantization** only for drums (8th notes); bass & chords play immediately for expressiveness
- **Hold-to-sustain** on bass and chords for melodic/harmonic control
- **URL params** determine instrument: `play.html?room=JAM4&instrument=drums`

---

## Files

| File | Purpose | Edit for... |
|------|---------|-------------|
| `host.template.html` | Host screen template (with API key placeholder) | Adding sounds, changing synths, UI changes to TV display |
| `play.template.html` | Phone controller template (with API key placeholder) | Adding instruments, changing controls, phone UI |
| `build.py` | Build script that generates HTML from templates | Modifying build process |
| `host.html` | Generated host file (gitignored) | Don't edit directly - edit the template |
| `play.html` | Generated player file (gitignored) | Don't edit directly - edit the template |
| `TECHNICAL_SPEC.md` | Detailed architecture docs | Reference only (update if making structural changes) |
| `WEBRTC_ARCHITECTURE.md` | **WebRTC migration plan** | **Read before implementing WebRTC/low-latency features** |
| `README.md` | User setup guide | Update if setup process changes |
| `TODO.md` | Feature roadmap and completed work | Track progress |

---

## Common Tasks

### Adding a New Instrument

1. **In `host.html`**:
   - Add a new Tone.js synth in the audio setup section
   - Add a `play[Name]()` function following the pattern of `playDrum()`, `playBass()`, `playChord()`
   - Add a case to the message handler switch in `setupAbly()`
   - Add a player card in the HTML (copy existing `instrument-card` div)
   - Update the `players` state object
   - Add join URL to `updateJoinUrls()`

2. **In `play.html`**:
   - Add an entry to the `instrumentConfigs` object with:
     - `emoji`: Display emoji
     - `name`: Display name
     - `render()`: Returns HTML string for the controller UI
     - `setup(sendFn)`: Attaches event listeners, calls `sendFn({...})` on interaction

### Changing Sounds

All synths are defined in `host.html`. Look for:
- `drumSynths` object — kick, snare, hat, clap
- `bassSynth` — MonoSynth with filter
- `chordSynth` — PolySynth

Tone.js docs: https://tonejs.github.io/docs/

### Changing Musical Scale

In `host.html`, modify:
- `bassNotes` object — maps UI keys to actual pitches
- `chordNotes` object — maps chord names to note arrays

### Changing Tempo

In `host.html`:
```javascript
const BPM = 120;  // Change this value
```

### Changing Session Duration

In `host.html`:
```javascript
const SESSION_DURATION = 180;  // Seconds (180 = 3 minutes)
```

### Changing Quantization

In `host.template.html`:
```javascript
const QUANTIZE_SUBDIVISION = '8n';  // Currently 8th notes (only used for drums)
```

**Note:** Only drums use quantization. Bass and chords play immediately for expressive control. To add quantization to bass/chords, modify `playBass()` and `playChord()` to use `Tone.Transport.nextSubdivision(QUANTIZE_SUBDIVISION)` as the time parameter.

---

## Message Protocol

### Player → Host (topic: `player`)

```javascript
// Join
{ type: 'join', instrument: 'drums', name: 'Alex' }

// Drums (with velocity)
{ type: 'drums', note: 'kick', velocity: 0.8 }  // velocity: 0.0-1.0

// Bass (with sustain action)
{ type: 'bass', note: 'C', action: 'on' }   // Start note
{ type: 'bass', note: 'C', action: 'off' }  // Release note
// Notes: 'C', 'D', 'E', 'F', 'G', 'A', 'B'

// Chords (with sustain action)
{ type: 'chords', chord: 'Am', action: 'on' }   // Start chord
{ type: 'chords', chord: 'Am', action: 'off' }  // Release chord
// Chords: 'Am', 'F', 'C', 'G', 'Em', 'Dm'
```

### Host → Players (topic: `host`)

```javascript
{ type: 'beat', beat: 0 }  // 0, 1, 2, or 3
```

### Host → Players (topic: `session`)

```javascript
// Session start (includes sync data for beat indicators)
{
  type: 'session',
  status: 'playing',
  timeRemaining: 180,
  startTime: 1234567890123,  // timestamp for beat sync (note: still has drift issues)
  bpm: 120                    // beats per minute
}

// Session end
{ type: 'session', status: 'ended' }
```

**Note:** Beat synchronization currently uses time-based calculation but still has drift issues due to network latency. This is a known limitation that needs improvement (see TODO.md).

---

## Dependencies

Only two, both loaded from CDN:

| Library | Version | Purpose |
|---------|---------|---------|
| Tone.js | 14.8.49 | Audio synthesis & scheduling |
| Ably | 1.x | Real-time WebSocket messaging |

**Do not add npm, webpack, React, or any build tools unless explicitly requested.**

---

## Testing Locally

```bash
# Build the project (generates HTML from templates)
python3 build.py

# Start server
python3 -m http.server 8000

# Host (open in browser)
http://localhost:8000/host.html

# Players (open in separate tabs or on phone)
http://localhost:8000/play.html?room=XXXX&instrument=drums
http://localhost:8000/play.html?room=XXXX&instrument=bass
http://localhost:8000/play.html?room=XXXX&instrument=chords
```

Replace `XXXX` with room code shown on host screen.
Replace `localhost` with your computer's IP for phone testing.

**Important:** After editing template files, run `python3 build.py` to regenerate the HTML files.

---

## Code Style

- **Vanilla JavaScript** — no TypeScript, no JSX
- **Inline styles** — CSS is in `<style>` tags within each HTML file
- **No modules** — everything in global scope (it's an MVP)
- **Descriptive function names** — `playDrum()`, `updateBeatIndicator()`, `showActivity()`

---

## Things to Avoid

1. **Don't add npm/webpack/bundlers** — we use a simple Python build script only
2. **Don't add React/Vue/Svelte** — vanilla JS is fine for this scope
3. **Don't split into many files** — 2 template files is intentional for simplicity
4. **Don't add audio to phones** — centralized audio on host is a key design decision
5. **Be careful with quantization** — drums use it for tight rhythm, but bass/chords are immediate for expressiveness

---

## If You Need More Context

Read `TECHNICAL_SPEC.md` for:
- Detailed architecture diagrams
- Complete state variable documentation
- All function signatures
- CSS architecture notes
- Known limitations
- Future extension ideas

---

## Example Modification Requests

Here are example prompts that might be asked and how to approach them:

**"Add a melody instrument"**
→ See "Adding a New Instrument" section above

**"Make the drums sound more like real drums"**
→ Modify `drumSynths` in host.html, consider using `Tone.Sampler` with audio files

**"Add a way to change tempo during the session"**
→ Add UI controls on host, broadcast tempo changes to players, update `Tone.Transport.bpm.value`

**"Make the bass keys larger on mobile"**
→ Modify `.bass-key` CSS in play.html, adjust `flex: 1` or add explicit heights

**"Add more chords"**
→ Add to `chordNotes` in host.template.html, add button to chords UI in play.template.html `instrumentConfigs`, adjust grid layout CSS if needed

**"Make bass/chords use quantization like drums"**
→ In host.template.html, modify `playBass()` and `playChord()` to add `const time = Tone.Transport.nextSubdivision(QUANTIZE_SUBDIVISION);` and pass `time` to triggerAttack/triggerRelease calls
