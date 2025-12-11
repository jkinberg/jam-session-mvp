# CLAUDE.md — Instructions for AI Assistants

This file provides context for Claude Code, Cursor, and other AI coding assistants working on this project.

---

## Project Summary

**Jam Session** is a multiplayer music party game MVP. Players join via phones, tap virtual instruments, and all audio plays on a shared TV screen. The goal is to test whether collaborative music-making is fun before building a more complex product.

**Key constraint**: This is intentionally minimal. Resist the urge to add complexity, frameworks, or dependencies unless specifically requested.

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
- **Quantization** snaps notes to 16th notes (sounds tight even with latency)
- **URL params** determine instrument: `play.html?room=JAM4&instrument=drums`

---

## Files

| File | Purpose | Edit for... |
|------|---------|-------------|
| `host.html` | Shared screen, audio engine, visualizer | Adding sounds, changing synths, UI changes to TV display |
| `play.html` | Phone controller, all 3 instrument UIs | Adding instruments, changing controls, phone UI |
| `TECHNICAL_SPEC.md` | Detailed architecture docs | Reference only (update if making structural changes) |
| `README.md` | User setup guide | Update if setup process changes |

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

In `host.html`:
```javascript
const QUANTIZE_SUBDIVISION = '16n';  // Try '8n' for 8th notes, '4n' for quarter
```

---

## Message Protocol

### Player → Host (topic: `player`)

```javascript
// Join
{ type: 'join', instrument: 'drums', name: 'Alex' }

// Notes
{ type: 'drums', note: 'kick' }      // 'kick', 'snare', 'hat', 'clap'
{ type: 'bass', note: 'C' }          // 'C', 'D', 'E', 'F', 'G', 'A', 'B'
{ type: 'chords', chord: 'Am' }      // 'Am', 'F', 'C', 'G'
```

### Host → Players (topic: `host`)

```javascript
{ type: 'beat', beat: 0 }  // 0, 1, 2, or 3
```

### Host → Players (topic: `session`)

```javascript
{ type: 'session', status: 'playing', timeRemaining: 180 }
{ type: 'session', status: 'ended' }
```

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
# Start server
python -m http.server 8000

# Host (open in browser)
http://localhost:8000/host.html

# Players (open in separate tabs or on phone)
http://localhost:8000/play.html?room=XXXX&instrument=drums
http://localhost:8000/play.html?room=XXXX&instrument=bass
http://localhost:8000/play.html?room=XXXX&instrument=chords
```

Replace `XXXX` with room code shown on host screen.
Replace `localhost` with your computer's IP for phone testing.

---

## Code Style

- **Vanilla JavaScript** — no TypeScript, no JSX
- **Inline styles** — CSS is in `<style>` tags within each HTML file
- **No modules** — everything in global scope (it's an MVP)
- **Descriptive function names** — `playDrum()`, `updateBeatIndicator()`, `showActivity()`

---

## Things to Avoid

1. **Don't add a build process** — keep it as simple HTML files
2. **Don't add React/Vue/Svelte** — vanilla JS is fine for this scope
3. **Don't split into many files** — 2 HTML files is intentional for simplicity
4. **Don't add audio to phones** — centralized audio on host is a key design decision
5. **Don't remove quantization** — it's what makes non-musicians sound good

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

**"Add a 5th chord option"**
→ Add to `chordNotes` in host.html, add button to chords UI in play.html `instrumentConfigs`
