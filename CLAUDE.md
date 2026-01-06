# CLAUDE.md — Instructions for AI Assistants

This file provides context for Claude Code, Cursor, and other AI coding assistants working on this project.

---

## Project Summary

**Jam Session** is a multiplayer music party game. Players join via phones, build looping patterns on virtual instruments, and all audio plays on a shared TV screen.

**Current Status:** V1 (Sequencer) live on `main` branch
**V0 Tag:** `v0` — Previous real-time trigger-based version

**Key constraint**: This is intentionally minimal. Resist the urge to add complexity, frameworks, or dependencies unless specifically requested.

**V1 Spec:** See `v1-planning/V1_SEQUENCER_SPEC.md` for complete technical specification.

---

## V1 Key Features

- **Lobby System**: Host opens room → players scan QR codes → "Start Jam Session" begins
- **16-Step Sequencer**: Players build looping patterns, host plays in perfect sync
- **4 Instruments**: Drums, Percussion (Latin), Bass (piano roll), Chords (4-slot picker)
- **Audio Visualizer**: Full-screen pulsing gradient with particle system
- **Master Audio Bus**: Compressor, limiter, reverb for polished sound
- **Late Joiner Support**: Players can join mid-session
- **Translucent UI**: Instrument rows show visualizer through

---

## Quick Context

### V1 Architecture (Sequencer)

```
HOST (TV/laptop)                    PHONES (controllers)
┌─────────────────┐                 ┌─────────────────┐
│  host.html      │◄── Ably ───────│  drums.html     │
│  - 16-step loop │    Patterns    │  - 4×4 grid     │
│  - 4 inst rows  │                │  - Live mode    │
│  - Tone.js      │                ├─────────────────┤
│  - Visualizer   │                │  percussion.html│
└─────────────────┘                │  - 4×4 grid     │
                                   │  - Live mode    │
                                   ├─────────────────┤
                                   │  chords.html    │
                                   │  - 4 slots      │
                                   │  - Send to Mix  │
                                   ├─────────────────┤
                                   │  bass.html      │
                                   │  - Piano roll   │
                                   │  - Send to Mix  │
                                   └─────────────────┘
```

**Key Difference from V0:**
- V0: Phone taps → network → host plays (timing depends on network)
- V1: Phone edits pattern → host stores → host plays on beat (perfect timing)

---

## Files

| File | Purpose | Edit for... |
|------|---------|-------------|
| `index.template.html` | Landing page with instructions | Welcome message, setup instructions |
| `host.template.html` | Host screen with lobby, sequencer, visualizer | Lobby flow, audio, visuals |
| `drums.template.html` | Drums phone UI | 4×4 grid, sound selector, live mode |
| `percussion.template.html` | Percussion phone UI | Latin sounds, same pattern as drums |
| `chords.template.html` | Chords phone UI | 4-slot picker, Send to Mix |
| `bass.template.html` | Bass phone UI | Piano roll, variable note lengths |
| `build.py` | Build script | Adding new templates, env vars |
| `v1-planning/V1_SEQUENCER_SPEC.md` | V1 technical spec | Architecture reference |
| `TODO.md` | Task tracking | Implementation progress |
| `ROADMAP.md` | Product roadmap | Strategic planning |
| `ANALYTICS_PLAN.md` | GA4 analytics plan | Event tracking reference |
| `v0-planning/` | V0 technical specs | WebRTC, groove meter, V0 architecture |
| `archive/` | V0 templates | Reference only |

---

## Common Tasks

### Adding Sounds to an Instrument

In the host template, add synth definition:
```javascript
const percussionSynths = {
  cowbell: new Tone.MetalSynth({ frequency: 800 }),
  // ... more sounds
};
```

In the instrument template, add to sound selector and update pattern messages.

### Changing the Sequencer Loop

In `host.template.html`:
```javascript
const BPM = 120;           // Tempo
const STEPS = 16;          // Steps per loop
const SESSION_DURATION = 180; // Seconds
```

### Understanding Update Modes

**Live Mode (Drums, Percussion):**
- Changes sent immediately on each tap
- Pattern updates apply to next playthrough

**Draft → Send Mode (Chords, Bass):**
- Edits are local until "Send to Mix" pressed
- Allows building complete patterns before committing

### Session Flow

1. **Welcome Screen** → Host clicks "Open Room"
2. **Lobby** → Room code + QR codes shown, players join on phones
3. **Ready** → Players enter names, appear in lobby list
4. **Start** → Host clicks "Start Jam Session"
5. **Playing** → 3-minute timer, visualizer active, patterns play
6. **End** → Timer expires or host clicks "End Session" → End screen

**Late Joiners:** If a player scans QR after session starts, they can still join.

### Audio Mixing

Host uses a master audio bus:
```javascript
// Signal chain: synths → compressor → reverb → limiter → destination
masterCompressor → reverb → masterLimiter → Tone.Destination
```

Individual instrument volumes are balanced in the synth definitions.

### Analytics (GA4)

All templates include GA4 tracking. See `ANALYTICS_PLAN.md` for full specification.

**Host events:**
- `session_created` — Room code generated
- `lobby_opened` — Host clicks "Open Room"
- `session_started` — Host clicks "Start Jam Session" (includes player_count)
- `session_ended` — Timer expires or early exit (includes duration, loops, players)
- `player_joined` — Player connects (includes instrument)
- `survey_clicked` — Survey link clicked on end screen

**Instrument events:**
- `player_loaded` — Page loaded
- `player_connected` — Ably connected
- `pattern_sent` — Pattern sent to mix (chords/bass only)
- `survey_clicked` — Survey link clicked on end screen
- `connection_error` — Ably connection failed

---

## Message Protocol (V1)

### Phone → Host

```javascript
// Player joined
{ type: "player_joined", instrument: "drums", player: "Julius" }

// Drums/Percussion pattern (Live mode - sent on each change)
{
  type: "pattern_update",
  instrument: "drums",
  player: "Julius",
  pattern: [
    { step: 0, sound: "kick" },
    { step: 2, sound: "snare" },
    // only steps with sounds
  ]
}

// Chords pattern (Draft → Send mode)
{
  type: "pattern_update",
  instrument: "chords",
  player: "Jordan",
  pattern: [
    { step: 0, chord: "Am", duration: 4 },
    { step: 4, chord: "F", duration: 4 },
    // each chord spans 4 beats
  ]
}

// Bass pattern (Draft → Send mode)
{
  type: "pattern_update",
  instrument: "bass",
  player: "Jovelle",
  pattern: [
    { step: 0, note: "C", duration: 3 },
    { step: 5, note: "G", duration: 4 },
    // variable durations
  ]
}
```

### Host State Structure

```javascript
const sessionState = {
  room: "XK7M",
  bpm: 120,
  currentStep: 0,        // 0-15
  timeRemaining: 180,

  instruments: {
    drums: { player: "Julius", pattern: [...] },
    percussion: { player: null, pattern: [] },
    bass: { player: "Jovelle", pattern: [...] },
    chords: { player: "Jordan", pattern: [...] }
  }
};
```

---

## Dependencies

Only two external dependencies (CDN):

| Library | Version | Purpose |
|---------|---------|---------|
| Tone.js | 14.8.49 | Audio synthesis & sequencing |
| Ably | 1.x | Real-time WebSocket messaging |

**Do not add npm, webpack, React, or any build tools unless explicitly requested.**

---

## Testing Locally

```bash
# Build all HTML files from templates
python3 build.py

# Start server
python3 -m http.server 8000

# Host (open in browser)
http://localhost:8000/host.html

# Instruments (open in separate tabs or on phone)
http://localhost:8000/drums.html?room=XXXX
http://localhost:8000/percussion.html?room=XXXX
http://localhost:8000/chords.html?room=XXXX
http://localhost:8000/bass.html?room=XXXX
```

Replace `XXXX` with room code shown on host screen.

**Testing on phones (localhost):**
1. When on localhost, the lobby shows an IP override field
2. Enter your computer's local IP (e.g., 192.168.1.100)
3. QR codes will update with the correct URL for phone access

**Important:** After editing template files, run `python3 build.py` to regenerate.

---

## Deployment & Git Workflow

**Live URL:** https://jam-mvp-xi.vercel.app
**Current Branch:** `main`

Vercel auto-deploys:
- Push to `main` → production deployment
- Push to feature branch → preview deployment

### Recommended Workflow

```bash
# Create feature branch for new work
git checkout -b feature/your-feature

# Make changes
python3 build.py
git add .
git commit -m "Description of changes"
git push origin feature/your-feature

# Create PR and merge to main when ready
```

---

## Code Style

- **Vanilla JavaScript** — no TypeScript, no JSX
- **Inline styles** — CSS in `<style>` tags within each HTML file
- **No modules** — everything in global scope (simple for MVP)
- **Descriptive function names** — `playDrumSound()`, `updatePlayhead()`, `renderPattern()`

---

## Things to Avoid

1. **Don't add npm/webpack/bundlers** — we use a simple Python build script
2. **Don't add React/Vue/Svelte** — vanilla JS is fine for this scope
3. **Don't split into many JS files** — inline in HTML is intentional
4. **Don't add audio to phones** — centralized audio on host is key
5. **Don't over-engineer** — V1 is still an MVP, keep it simple

---

## Example Modification Requests

**"Add a new percussion sound"**
→ Add synth to `percussionSynths` in host, add button to percussion UI

**"Change the loop length to 8 steps"**
→ Change `STEPS` constant, update UI grids, adjust duration calculations

**"Make chords use live mode instead of send-to-mix"**
→ Remove draft state, send pattern on each tap instead of button press

**"Add a 5th instrument slot"**
→ Add row to host, create new template, update build.py, add synths

---

## V0 Reference

V0 templates are archived in `archive/` directory. Key differences:
- Single `play.html` for all instruments (V1 has separate files)
- Real-time triggers instead of patterns
- No sequencer visualization on host

If you need to understand V0 behavior, check the archived templates.
