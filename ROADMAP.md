# Jam Session - Product Roadmap

## Overview

This document provides strategic prioritization and planning for Jam Session features.

**Last Updated:** January 2025
**Current Version:** V1 Sequencer (in development)
**Branch:** `feature/v1-sequencer`
**V0 Tag:** `v0` — Previous real-time trigger-based version

---

## Version History

### V0 - Real-Time Triggers (Completed, Tagged)
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

### V1 - Sequencer (Current Development)
- Players build **16-step looping patterns** instead of triggering sounds
- Phones edit patterns → host plays them in perfect sync
- 4 instruments: Drums, Percussion, Bass, Chords
- New **Latin percussion** sounds (cowbell, tambourine, shaker, conga)
- "Send to Mix" workflow for melodic instruments
- **Lobby system** for player onboarding before session starts
- **Audio visualizer** with pulsing gradient and particles
- All timing handled by host (eliminates latency issues)

**Why the change?** The sequencer approach directly addresses V0 feedback:
- Loop provides structure and goals (not random mashing)
- The loop IS the background track (always playing)
- Patterns persist and loop (recording built-in)
- Percussion instrument adds Latin sounds

---

## V1 Implementation Status

See `v1-planning/V1_SEQUENCER_SPEC.md` for detailed technical specification.
See `TODO.md` for implementation checklist.

### Phase 1: Foundation & Infrastructure ✅ Complete

- Archive V0 templates
- Update build process for multiple instrument files
- New host screen with 4 instrument rows
- 16-step playhead animation
- Tone.js Transport

### Phase 2: Drums ✅ Complete

- Drums phone UI (4×4 grid)
- Live mode pattern editing
- Host receives/renders/plays drum patterns

### Phase 3: Percussion ✅ Complete

- Latin percussion sounds (cowbell, tambourine, shaker, conga)
- Same Live mode as drums
- Multi-instrument handling on host

### Phase 4: Chords ✅ Complete

- 4-slot chord progression picker
- "Send to Mix" workflow
- Sustained chord playback

### Phase 5: Bass ✅ Complete

- Piano roll UI for bass notes
- Variable-length sustained notes
- Swipe-to-sustain gesture

### Phase 6: Polish & Launch (In Progress)

- [x] Timer, end session button
- [x] Lobby system (Open Room → Join → Start)
- [x] Late joiner support
- [x] Audio visualizer (gradient + particles)
- [x] Master audio bus (compressor, limiter, reverb)
- [x] Translucent UI for visualizer
- [ ] **Survey link on end screen**
- [ ] **GA4 analytics integration**
- [ ] Final testing and documentation
- [ ] Merge to main

---

## Pre-Launch Checklist

Before merging V1 to main:

- [ ] Add survey link to end screen (host + all player UIs)
- [ ] Implement GA4 analytics events for V1 flow
- [ ] Test on real phones (iOS Safari, Android Chrome)
- [ ] Test on TV/large screen
- [ ] Update all documentation
- [ ] Create demo video or screenshots

---

## Deferred Features (Post-V1)

These features are deferred until V1 is complete and validated:

### Maybe for V1.x
- **Longer chord sustain** — Allow full 16-step sustained chords
- **Groove meter & feedback** — May reintroduce in sequencer context
- **Sound quality upgrades** — Enhanced synth presets

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

### January 2025 (V1 Development)
- Implemented lobby system for better player onboarding
- Added audio visualizer with particles for visual engagement
- Added master audio bus with compressor, limiter, reverb
- Made UI translucent to show visualizer through instrument rows
- Fixed late joiner support (players can join mid-session)
- Fixed bass/chord sustain release on session end

### January 2025 (V1 Start)
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
