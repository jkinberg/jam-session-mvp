# Jam Session - Product Roadmap

## Overview

This document provides strategic prioritization and planning for Jam Session features.

**Last Updated:** January 2025
**Current Version:** V0 (tagged `v0`)
**In Development:** V1 Sequencer (`feature/v1-sequencer` branch)

---

## Version History

### V0 - Real-Time Triggers (Completed)
- Players tap phone buttons → sounds play on host
- Real-time triggers with network latency
- 3 instruments: Drums, Bass, Chords
- Hold-to-sustain for bass/chords
- Drum quantization to 8th notes

**User Feedback from V0:**
- "Feels like random button mashing" — no structure or goal
- "Would love a background track to play along with" — need musical context
- "Recording/playback feature" — want to hear what they made
- Requests for more sounds, especially Latin percussion

### V1 - Sequencer (In Development)
- Players build **16-step looping patterns** instead of triggering sounds
- Phones edit patterns → host plays them in perfect sync
- 4 instruments: Drums, Percussion, Bass, Chords
- New **Latin percussion** sounds (cowbell, tambourine, shaker, conga)
- "Send to Mix" workflow for melodic instruments
- All timing handled by host (eliminates latency issues)

**Why the change?** The sequencer approach directly addresses V0 feedback:
- Loop provides structure and goals (not random mashing)
- The loop IS the background track (always playing)
- Patterns persist and loop (recording built-in)
- Percussion instrument adds Latin sounds

---

## V1 Implementation Roadmap

See `v1-planning/V1_SEQUENCER_SPEC.md` for detailed technical specification.

### Phase 1: Foundation & Infrastructure
**Status:** Not started

- Archive V0 templates
- Update build process for multiple instrument files
- New host screen with 4 instrument rows
- 16-step playhead animation
- Tone.js Transport (visual only, no audio)

### Phase 2: Drums (Full Vertical Slice)
**Status:** Not started

- Drums phone UI (4×4 grid)
- Live mode pattern editing
- Host receives/renders/plays drum patterns
- Validates core architecture

### Phase 3: Percussion
**Status:** Not started

- Latin percussion sounds
- Same Live mode as drums
- Multi-instrument handling on host

### Phase 4: Chords (Draft → Send Mode)
**Status:** Not started

- 4-slot chord progression picker
- "Send to Mix" workflow
- Sustained chord playback

### Phase 5: Bass (Piano Roll)
**Status:** Not started

- Piano roll UI for bass notes
- Variable-length sustained notes
- Completes all instruments

### Phase 6: Polish & Launch
**Status:** Not started

- Timer, end session, end screen
- Visual polish
- Testing and documentation
- Merge to main

---

## Deferred Features (Post-V1)

These features from the V0 roadmap are deferred until V1 is complete and validated:

### Maybe for V1.x
- **Groove meter & feedback** — May reintroduce in sequencer context
- **Sound quality upgrades** — Master effects chain
- **Host screen visuals** — Particle effects, animations

### Longer Term
- **WebRTC migration** — Less critical now that patterns (not triggers) are sent
- **Challenge/tutorial mode** — Guided patterns to follow
- **Session recording/playback** — Export loops as audio

### Revisit After V1 Feedback
- **Additional instruments** — Melody synth, FX controller
- **Tempo control** — User-adjustable BPM
- **Custom scales** — Different key/mode options

---

## Decision Log

### January 2025
- Tagged V0 release before starting V1 work
- Created `feature/v1-sequencer` branch
- Decided to pivot to sequencer approach based on user feedback
- Prioritized Latin percussion (cowbell, conga, etc.) based on user requests
- Decided to keep inline JS in HTML templates (simpler than modules)
- Decided to archive V0 templates rather than delete

### December 2024
- Implemented Google Analytics 4
- Created comprehensive V0 roadmap
- Collected initial user feedback via survey

---

## Success Metrics for V1

### Quantitative
- Session completion rate >70%
- Players actively editing patterns (not just watching)
- Multi-player sessions (2+ players) >50%
- Positive survey feedback (avg >4/5 on "fun")

### Qualitative
- "This feels like we're making music together"
- "I want to play again and try different patterns"
- "The loop sounds cool"
- Reduced feedback about "random button mashing"

---

## Notes

- This is a living document — update as we learn more
- V1 is a significant pivot from V0; expect iteration
- User feedback drives all decisions
- Focus on fun first, polish second
