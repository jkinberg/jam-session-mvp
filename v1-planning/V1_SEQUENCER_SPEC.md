# Jam Session V1 - Sequencer Technical Specification

## Overview

This document specifies the V1 redesign of Jam Session, transforming it from a real-time trigger-based jam experience (V0) into a collaborative sequencer where players build looping patterns together.

**Branch:** `feature/v1-sequencer`
**V0 Tag:** `v0` (tagged before this work began)

### Why This Change?

User feedback from V0 revealed:
- "Feels like random button mashing" — no structure or goal
- "Would love a background track to play along with" — need musical context
- "Recording/playback feature" — want to hear what they made
- Latency/sync issues — real-time triggers are hard to synchronize

The sequencer approach solves these problems:
- Players **build patterns** instead of triggering sounds randomly
- The **loop IS the structure** — it provides musical context
- Patterns are **visible on the host screen** — see what you're creating
- **All audio plays on host** — eliminates phone-to-host latency issues

### Core Concept

```
V0 (Real-time triggers):
Phone taps → network delay → Host plays sound (timing depends on network)

V1 (Sequencer):
Phone edits pattern → Host stores pattern → Host plays on beat (perfect timing)
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOST (TV/Laptop)                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SEQUENCER STATE                               │   │
│  │  drums:      [K, _, S, _, K, _, S, H, K, _, S, _, K, H, S, H]   │   │
│  │  percussion: [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]   │   │
│  │  bass:       [{C,3}, _, _, _, {G,4}, _, _, _, {F,1}, ...]       │   │
│  │  chords:     [{Am,4}, _, _, _, {F,4}, _, _, _, {C,4}, ...]      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   VISUAL DISPLAY                                 │   │
│  │   4 instrument rows with QR codes + 16-step sequences           │   │
│  │   Playhead sweeps across, glowing current notes                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    TONE.JS SEQUENCER                             │   │
│  │   Transport runs at 120 BPM                                      │   │
│  │   Sequence triggers sounds based on state at each step          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Ably Messages
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │  Phone  │          │  Phone  │          │  Phone  │
   │  DRUMS  │          │  BASS   │          │ CHORDS  │
   │  4x4    │          │  Piano  │          │  4 slot │
   │  grid   │          │  roll   │          │  picker │
   └─────────┘          └─────────┘          └─────────┘
```

### Key Design Decisions

1. **All audio on host** — Single clock source, no sync issues
2. **Phones send patterns, not triggers** — Data updates, not real-time audio events
3. **16-step loop** — 4 bars at 120 BPM, loops continuously
4. **Each instrument has unique UI** — Optimized for that instrument's nature
5. **Two update modes:**
   - **Live mode** (Drums, Percussion) — Changes apply immediately
   - **Draft → Send mode** (Bass, Chords) — Preview locally, commit when ready

---

## Instruments Specification

### Summary Table

| Instrument | Phone UI | Sounds/Notes | Sustain | Update Mode |
|------------|----------|--------------|---------|-------------|
| **Drums** | 4×4 tap grid | Kick, Snare, HiHat, Clap | No | Live |
| **Percussion** | 4×4 tap grid | Cowbell, Tambourine, Shaker, Conga | No | Live |
| **Bass** | Piano roll (drag) | C, D, E, F, G, A (6 notes) | Yes (variable) | Draft → Send |
| **Chords** | 4 big slots | Am, F, C, G | Yes (4 beats each) | Draft → Send |

### Musical Constraints

**Key:** C major / A minor

**Chord progression options:** Am, F, C, G (all diatonic to C major)

**Bass scale:** C, D, E, F, G, A (C major without B — avoids dissonance, includes all chord roots)

**Why these constraints:**
- "No wrong notes" philosophy — any combination sounds acceptable
- All 4 chord roots (A, C, F, G) available in bass scale
- Pentatonic-adjacent scale is forgiving for non-musicians

---

## Host Screen Specification

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│   JAM SESSION                                                    Room: XK7M   2:45  │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────┐   🥁 DRUMS                                                             │
│  │         │   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                   │
│  │ [QR]    │   │K │  │S │  │K │  │S │H │K │  │S │  │K │H │S │H │  Julius           │
│  │         │   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                   │
│  └─────────┘                                                                        │
│                                                                                     │
│  ┌─────────┐   🎵 PERCUSSION                                     (greyed out)       │
│  │         │   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                   │
│  │ [QR]    │   │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  Scan to join     │
│  │         │   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                   │
│  └─────────┘                                                                        │
│                                                                                     │
│  ┌─────────┐   🎸 BASS                                                              │
│  │         │   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                   │
│  │ [QR]    │   │C ━━━━━━│  │  │G ━━━━━━━━━│F ━│E ━━━━━│C │G ━━━│  Jovelle          │
│  │         │   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                   │
│  └─────────┘                                                                        │
│                                                                                     │
│  ┌─────────┐   🎹 CHORDS                                                            │
│  │         │   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                   │
│  │ [QR]    │   │Am━━━━━━━━━━━│F ━━━━━━━━━━━│C ━━━━━━━━━━━│G ━━━│  Jordan           │
│  │         │   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                   │
│  └─────────┘                                                                        │
│                                                                                     │
│                              ┌─────────────────────┐                                │
│                              │   ● ● ● ○           │                                │
│                              │   120 BPM           │                                │
│                              │   [ END SESSION ]   │                                │
│                              └─────────────────────┘                                │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Row Visual States

| State | Visual Treatment |
|-------|------------------|
| **No player joined** | Row greyed out, empty grid visible, "Scan to join" label |
| **Player joined** | Row full brightness, player name displayed, QR stays visible |
| **Update received** | Row flashes/pulses briefly (~0.5 seconds) |

### QR Code Behavior

- QR codes **always visible** (even after player joins)
- Allows player to switch instruments or new player to take over
- Each QR encodes URL with room code + instrument: `https://[domain]/drums.html?room=XK7M`

### Playhead Visualization

**For single-hit instruments (Drums, Percussion):**
- Current step cell glows/pulses
- Only the single cell lights up

**For sustained instruments (Bass, Chords):**
- Entire sustained note glows when playhead is within it
- Shows which note is currently sounding, not just which step

```
Example - Step 5 playing within a G note that spans steps 5-8:

│C ━━━━━━│  │  │▓▓▓▓▓▓▓▓▓▓▓│F ━│...
               ↑↑↑↑↑↑↑↑↑↑↑
            entire G note glowing
```

### Session Flow

1. **Host opens app** → Room code generated, 4 rows shown (all greyed out)
2. **Loop starts immediately** → Plays silence, playhead moves at 120 BPM
3. **Players scan QR codes** → Join instruments, rows light up
4. **Players build patterns** → Send updates, host receives, rows flash
5. **Timer counts down** → 3:00 → 0:00
6. **Session ends** → Timer hits zero OR host clicks "End Session"
7. **End screen** → Summary, survey link

### Host Controls

| Control | Function |
|---------|----------|
| Timer display | Shows remaining time (3:00 countdown) |
| BPM display | Shows tempo (120 BPM) — read-only for MVP |
| End Session button | Immediately ends session, goes to end screen |

---

## Phone UI Specifications

### Drums (Live Mode)

```
┌─────────────────────────────────────────┐
│ 🥁 DRUMS                    Room: XK7M  │
│ ─────────────────────────────────────── │
│                                         │
│  Select sound:                          │
│  ┌──────┬──────┬──────┬──────┐         │
│  │ KICK │SNARE │ HAT  │ CLAP │         │
│  │  ●   │      │      │      │ ← selected
│  └──────┴──────┴──────┴──────┘         │
│                                         │
│  Tap grid to place sounds:              │
│  ┌─────┬─────┬─────┬─────┐             │
│  │  K  │     │  S  │     │  1-4        │
│  ├─────┼─────┼─────┼─────┤             │
│  │  K  │     │  S  │  H  │  5-8        │
│  ├─────┼─────┼─────┼─────┤             │
│  │  K  │     │  S  │     │  9-12       │
│  ├─────┼─────┼─────┼─────┤             │
│  │  K  │  H  │  S  │  H  │  13-16      │
│  └─────┴─────┴─────┴─────┘             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         CLEAR ALL               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ● ● ○ ○  Live                         │
└─────────────────────────────────────────┘
```

**Interaction:**
- Tap sound button → Select that sound
- Tap empty grid cell → Add selected sound to that step
- Tap filled grid cell (same sound) → Remove sound
- Tap filled grid cell (different sound) → Replace with selected sound
- Changes sent to host immediately (live mode)

**Future enhancement:** Allow multiple sounds per step (layering)

---

### Percussion (Live Mode)

Same UI pattern as Drums, different sounds:
- Cowbell
- Tambourine
- Shaker
- Conga

All synthesized with Tone.js (no samples needed).

---

### Chords (Draft → Send Mode)

```
┌─────────────────────────────────────────┐
│ 🎹 CHORDS                   Room: XK7M  │
│ ─────────────────────────────────────── │
│                                         │
│  Build your progression:                │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │         │ │         │ │         │ │         │
│  │   Am    │ │    F    │ │    C    │ │    G    │
│  │  1-4    │ │   5-8   │ │  9-12   │ │  13-16  │
│  │         │ │         │ │         │ │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘
│                                         │
│  Tap to cycle: Am → F → C → G → Am...   │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         🔊 SEND TO MIX              ││
│  └─────────────────────────────────────┘│
│                                         │
│  In mix: Am - Am - F - G                │
│                                         │
│  ● ● ○ ○  Draft                        │
└─────────────────────────────────────────┘
```

**Interaction:**
- Tap any slot → Cycle through chord options (Am → F → C → G → Am...)
- Tap "Send to Mix" → Current progression sent to host
- "In mix" shows what's currently playing on host

**Sustain:** Each chord spans 4 beats (one slot = steps 1-4, 5-8, 9-12, or 13-16)

---

### Bass (Draft → Send Mode)

```
┌─────────────────────────────────────────┐
│ 🎸 BASS                     Room: XK7M  │
│ ─────────────────────────────────────── │
│                                         │
│  Drag to draw notes:                    │
│                                         │
│  Steps 1-8                              │
│   ┌───┬───┬───┬───┬───┬───┬───┬───┐    │
│ A │   │   │   │   │   │   │   │   │    │
│ G │   │   │▓▓▓▓▓▓▓▓▓▓▓│   │   │   │    │
│ F │   │   │   │   │   │   │   │   │    │
│ E │   │   │   │   │   │   │   │   │    │
│ D │   │   │   │   │   │   │   │   │    │
│ C │▓▓▓▓▓▓▓│   │   │   │   │   │   │    │
│   └───┴───┴───┴───┴───┴───┴───┴───┘    │
│     1   2   3   4   5   6   7   8       │
│                                         │
│  Steps 9-16                             │
│   ┌───┬───┬───┬───┬───┬───┬───┬───┐    │
│ A │   │   │   │   │   │   │   │   │    │
│ G │   │   │   │   │   │▓▓▓▓▓▓▓│   │    │
│ F │▓▓▓│   │   │   │   │   │   │   │    │
│ E │   │▓▓▓▓▓▓▓│   │   │   │   │   │    │
│ D │   │   │   │   │   │   │   │   │    │
│ C │   │   │   │▓▓▓│   │   │   │   │    │
│   └───┴───┴───┴───┴───┴───┴───┴───┘    │
│     9  10  11  12  13  14  15  16       │
│                                         │
│  ┌──────────┐  ┌─────────────────────┐ │
│  │  CLEAR   │  │   🔊 SEND TO MIX    │ │
│  └──────────┘  └─────────────────────┘ │
│                                         │
│  ● ● ○ ○  Draft                        │
└─────────────────────────────────────────┘
```

**Interaction:**
- Tap empty cell → Create 1-step note
- Drag horizontally → Create sustained note spanning multiple steps
- Tap existing note → Delete entire note
- Tap "Clear" → Remove all notes
- Tap "Send to Mix" → Pattern sent to host

**Layout:** Two 8-column panels (steps 1-8 and 9-16) to fit on phone screen

**Scale:** C, D, E, F, G, A (6 notes — C major without B)

---

## Message Protocol

### Phone → Host Messages

#### Pattern Update (Drums/Percussion)

```javascript
{
  type: "pattern_update",
  instrument: "drums",  // or "percussion"
  player: "Julius",
  pattern: [
    { step: 0, sound: "kick" },
    { step: 2, sound: "snare" },
    { step: 4, sound: "kick" },
    { step: 6, sound: "snare" },
    { step: 7, sound: "hihat" }
    // only include steps that have sounds
  ]
}
```

#### Pattern Update (Bass)

```javascript
{
  type: "pattern_update",
  instrument: "bass",
  player: "Jovelle",
  pattern: [
    { step: 0, note: "C", duration: 3 },   // C plays steps 0-2
    { step: 5, note: "G", duration: 4 },   // G plays steps 5-8
    { step: 9, note: "F", duration: 1 },   // F plays step 9 only
    { step: 10, note: "E", duration: 3 }   // E plays steps 10-12
  ]
}
```

#### Pattern Update (Chords)

```javascript
{
  type: "pattern_update",
  instrument: "chords",
  player: "Jordan",
  pattern: [
    { step: 0, chord: "Am", duration: 4 },   // Am for steps 0-3
    { step: 4, chord: "F", duration: 4 },    // F for steps 4-7
    { step: 8, chord: "C", duration: 4 },    // C for steps 8-11
    { step: 12, chord: "G", duration: 4 }    // G for steps 12-15
  ]
}
```

#### Player Joined

```javascript
{
  type: "player_joined",
  instrument: "drums",
  player: "Julius"
}
```

#### Player Left

```javascript
{
  type: "player_left",
  instrument: "drums",
  player: "Julius"
}
```

### Host State Structure

```javascript
const sessionState = {
  room: "XK7M",
  bpm: 120,
  currentStep: 0,        // 0-15, updated by Tone.js Transport
  timeRemaining: 180,    // seconds
  isPlaying: true,
  
  instruments: {
    drums: {
      player: "Julius",  // null if no player
      pattern: [
        { step: 0, sound: "kick" },
        { step: 2, sound: "snare" }
        // ...
      ]
    },
    percussion: {
      player: null,
      pattern: []
    },
    bass: {
      player: "Jovelle",
      pattern: [
        { step: 0, note: "C", duration: 3 }
        // ...
      ]
    },
    chords: {
      player: "Jordan",
      pattern: [
        { step: 0, chord: "Am", duration: 4 }
        // ...
      ]
    }
  }
};
```

---

## Audio Specification

### Tempo & Timing

- **BPM:** 120 (fixed for MVP)
- **Steps:** 16 (one loop = 4 bars of 4/4)
- **Step duration:** 125ms (60000ms / 120 BPM / 2 steps per beat)
- **Loop duration:** 2 seconds (16 steps × 125ms)
- **Session duration:** 3 minutes (90 loops)

### Sound Definitions (Tone.js)

#### Drums
```javascript
kick: new Tone.MembraneSynth()
snare: new Tone.NoiseSynth() + Tone.MembraneSynth()
hihat: new Tone.MetalSynth()
clap: new Tone.NoiseSynth()
```

#### Percussion
```javascript
cowbell: new Tone.MetalSynth({ frequency: 800 })
tambourine: new Tone.NoiseSynth({ noise: { type: 'white' } })
shaker: new Tone.NoiseSynth({ noise: { type: 'pink' } })
conga: new Tone.MembraneSynth({ pitchDecay: 0.05 })
```

#### Bass
```javascript
bass: new Tone.MonoSynth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.3 }
})
// Notes: C2, D2, E2, F2, G2, A2
```

#### Chords
```javascript
chords: new Tone.PolySynth(Tone.Synth)
// Voicings:
// Am: ['A3', 'C4', 'E4']
// F:  ['F3', 'A3', 'C4']
// C:  ['C3', 'E3', 'G3']
// G:  ['G3', 'B3', 'D4']
```

### Playback Logic

```javascript
// Pseudocode for sequencer playback
Tone.Transport.scheduleRepeat((time) => {
  const step = currentStep % 16;
  
  // Play drums
  const drumHit = drums.pattern.find(p => p.step === step);
  if (drumHit) playDrumSound(drumHit.sound, time);
  
  // Play percussion
  const percHit = percussion.pattern.find(p => p.step === step);
  if (percHit) playPercussionSound(percHit.sound, time);
  
  // Play bass (check if any note covers this step)
  const bassNote = bass.pattern.find(p => 
    step >= p.step && step < p.step + p.duration
  );
  if (bassNote && step === bassNote.step) {
    // Trigger note on first step of sustain
    playBassNote(bassNote.note, bassNote.duration, time);
  }
  
  // Play chords (same logic as bass)
  const chord = chords.pattern.find(p =>
    step >= p.step && step < p.step + p.duration
  );
  if (chord && step === chord.step) {
    playChord(chord.chord, chord.duration, time);
  }
  
  currentStep++;
}, '16n');
```

---

## File Structure

Following V0's "keep it simple" approach, we use inline JS in HTML files with template placeholders for environment variables. This avoids build tool complexity while maintaining the existing `build.py` workflow.

```
jam-session-mvp/
├── host.template.html      # Host screen template (TV/laptop)
├── drums.template.html     # Drums phone UI template
├── percussion.template.html # Percussion phone UI template
├── bass.template.html      # Bass phone UI template
├── chords.template.html    # Chords phone UI template
├── build.py                # Generates HTML from templates (extended for V1)
├── v1-planning/            # Planning documents and mockups
│   ├── V1_SEQUENCER_SPEC.md    # This document
│   ├── v1-host-screen-mockup.jsx
│   └── v1-phone-ui-mockups.jsx
├── archive/                # V0 templates (for reference)
│   ├── host.template.html.v0
│   └── play.template.html.v0
├── README.md
└── vercel.json
```

**Generated files (gitignored):**
- `host.html`, `drums.html`, `percussion.html`, `bass.html`, `chords.html`, `index.html`

**Build process:**
```bash
python3 build.py  # Generates all HTML files from templates
```

---

## Implementation Plan

**Branch:** `feature/v1-sequencer` (already created)
**Approach:** Each phase is a working increment; commit and push after each phase completes.

### Phase 1: Foundation & Infrastructure

**Goal:** Host screen with visual sequencer, no audio yet

- [ ] Archive V0 templates to `archive/` directory
- [ ] Update `build.py` to generate multiple instrument HTML files
- [ ] Create `host.template.html` with new layout:
  - [ ] 4 instrument rows (drums, percussion, bass, chords)
  - [ ] QR codes with instrument-specific URLs
  - [ ] 16-step grid visualization per row
  - [ ] Playhead animation at 120 BPM
  - [ ] Timer display, room code, beat indicator
- [ ] Ably connection setup (receive messages)
- [ ] Session state structure for patterns
- [ ] Row states: greyed out (no player) vs. active (player joined)
- [ ] Tone.js Transport running (scheduling only, no sounds)

**Deliverable:** Host visually loops through 16 steps, rows respond to player join messages

### Phase 2: Drums (Full Vertical Slice)

**Goal:** Complete drums implementation proves the core architecture

- [ ] Create `drums.template.html`:
  - [ ] Sound selector (Kick, Snare, HiHat, Clap)
  - [ ] 4×4 step grid
  - [ ] Tap to place selected sound
  - [ ] Tap filled cell to remove or replace
  - [ ] Clear All button
  - [ ] Beat indicator synced with host
- [ ] Live mode: changes sent immediately via Ably
- [ ] Host receives drum patterns
- [ ] Host renders drum pattern in grid (K, S, H, C)
- [ ] Host plays drum sounds on correct steps
- [ ] Row flash animation on pattern update
- [ ] Player name display
- [ ] Player disconnect handling (keep pattern playing)

**Deliverable:** Working drums end-to-end; validates core pattern

### Phase 3: Percussion

**Goal:** Second instrument validates multi-instrument handling

- [ ] Create `percussion.template.html` (same UI as drums)
- [ ] Sounds: Cowbell, Tambourine, Shaker, Conga
- [ ] Tone.js synth definitions for Latin percussion
- [ ] Host handles both drums and percussion simultaneously
- [ ] Verify audio mixing (no conflicts)

**Deliverable:** Two working Live-mode instruments

### Phase 4: Chords (Draft → Send Mode)

**Goal:** Establish "Send to Mix" workflow

- [ ] Create `chords.template.html`:
  - [ ] 4 large chord slots (beats 1-4, 5-8, 9-12, 13-16)
  - [ ] Tap slot to cycle: Am → F → C → G → Am...
  - [ ] "Send to Mix" button (highlighted when draft differs from sent)
  - [ ] "In mix:" display showing current host pattern
  - [ ] Beat indicator showing which slot is playing
- [ ] Draft state (local) vs. sent state (on host)
- [ ] Host receives chord progressions
- [ ] Host renders sustained chords (4 beats each)
- [ ] Host plays chord sounds with proper sustain/release
- [ ] Chord voicings: Am, F, C, G in octaves 3-4

**Deliverable:** Working Draft → Send workflow

### Phase 5: Bass (Piano Roll)

**Goal:** Variable-length notes with piano roll UI

- [ ] Create `bass.template.html`:
  - [ ] Two 8-column panels (steps 1-8, 9-16)
  - [ ] 6 rows: A, G, F, E, D, C (C major scale without B)
  - [ ] Tap empty cell: create 1-step note
  - [ ] Tap existing note: delete entire note
  - [ ] Future: drag to create sustained notes
  - [ ] Clear button
  - [ ] "Send to Mix" button
- [ ] Host receives bass patterns with durations
- [ ] Host renders variable-length notes (horizontal bars)
- [ ] Host plays bass with proper sustain/release

**Deliverable:** All 4 instruments working

### Phase 6: Polish & Launch

**Goal:** Production-ready V1

- [ ] Timer countdown (3:00 → 0:00)
- [ ] "End Session" button
- [ ] End screen with survey link
- [ ] Visual polish:
  - [ ] Colors per instrument
  - [ ] Row flash on update
  - [ ] Playhead glow effects
  - [ ] Smooth animations
- [ ] Mobile testing (various phone sizes)
- [ ] TV/large screen testing
- [ ] Analytics events (GA4)
- [ ] Update README with V1 instructions
- [ ] Update CLAUDE.md with V1 context
- [ ] Final testing with real users
- [ ] Merge to main → production deploy

---

## What to Keep from V0

| Component | Keep? | Notes |
|-----------|-------|-------|
| GitHub repo | ✅ Yes | History, structure |
| Vercel deployment | ✅ Yes | Auto-deploy pipeline |
| Ably integration | ✅ Yes | Same service, different message protocol |
| Google Analytics | ✅ Yes | Already configured |
| Room code generation | ✅ Yes | Same flow |
| QR code library | ✅ Yes | Same approach (inline via CDN) |
| Tone.js | ✅ Yes | Same audio engine |
| Build script pattern | ✅ Yes | Extended `build.py` for multiple files |
| V0 host.template.html | ❌ Archive | Complete rewrite → `archive/` |
| V0 play.template.html | ❌ Archive | Split into 4 instrument files → `archive/` |
| V0 message protocol | ❌ No | New pattern-based protocol |

---

## Open Questions for Implementation

1. **Should playhead be visible on phones?** Could help with timing, but adds complexity.
   - *Decision:* **No** — clock sync is unreliable; host screen is source of truth

2. **How to handle player disconnect mid-session?** Keep their pattern playing? Clear it?
   - *Decision:* Keep pattern playing (better for music continuity)

3. **Should there be a "mute" control per instrument on host?** Nice for debugging.
   - *Defer:* Not in initial V1, consider for polish phase

4. **End screen content?** Show the final patterns? Play back the last loop?
   - *Defer:* Keep simple for V1 (survey link + session summary)

5. **Should phones show current beat indicator?** Visual sync without audio.
   - *Decision:* **No** — same as #1; avoid misleading visual feedback from clock drift

## Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| File structure | Inline JS in HTML templates | Simpler, matches V0 approach |
| Build process | Extend existing `build.py` | Already works, just add more files |
| V0 templates | Archive to `archive/` directory | Keep for reference, not actively used |
| Implementation order | Chords before Bass | Chords simpler, establishes Send to Mix workflow |
| Version naming | This is V1, previous is V0 | Clear versioning from tagged release |
| Playhead on phones | **No** - host only | Clock sync between devices is unreliable; host is source of truth |
| Beat indicator on phones | **No** - remove from V1 | Same reasoning; avoid misleading visual feedback |
| Bass piano roll drag | Defer complexity | Start with tap-to-place; add drag-to-sustain later if needed |
| Percussion sounds | Synthesized for now | Validate interaction first; upgrade to samples later if needed |
| GA4 events | Defer to Phase 6 | Will evolve during implementation |

---

## Success Metrics

After launch, measure:

- **Session completion rate** — Do people play the full 3 minutes?
- **Patterns created per session** — Are people actively building?
- **Survey feedback** — "Was it fun?" scores
- **Multi-player sessions** — How often do 2+ people join?
- **Instrument distribution** — Which instruments are most popular?

---

## References

- [V0 Jam Session MVP](https://jam-mvp-xi.vercel.app/) — Current production (real-time triggers)
- [V0 Tag](https://github.com/jkinberg/jam-session-mvp/releases/tag/v0) — Snapshot before V1 work
- [bolt-audio-sequencer](https://github.com/jkinberg/bolt-audio-sequencer) — Previous 16-step drum sequencer project (reference)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Ably Documentation](https://ably.com/docs)
