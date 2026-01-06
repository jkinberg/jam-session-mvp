# TODO - Jam Session

## Current Focus: V1 Polish & Launch

**Branch:** `feature/v1-sequencer`
**Spec:** `v1-planning/V1_SEQUENCER_SPEC.md`

---

## Remaining Tasks

### Pre-Launch
- [ ] Add survey link to end screen (host and player UIs)
- [ ] Complete revised GA4 analytics integration
- [ ] Final mobile testing
- [ ] Final TV/large screen testing
- [ ] Merge to main and deploy

### Future Improvements
- [ ] Longer chord sustain option (full 16-step sustain)
- [ ] Groove meter & feedback system
- [ ] Session recording/playback
- [ ] Additional instruments

---

## V1 Implementation Status

### Phase 1: Foundation & Infrastructure ✅
- [x] Archive V0 templates to `archive/` directory
- [x] Update `build.py` to generate multiple HTML files
- [x] Create new `host.template.html`:
  - [x] 4 instrument rows (drums, percussion, bass, chords)
  - [x] QR codes with instrument-specific URLs
  - [x] 16-step grid visualization per row
  - [x] Playhead animation at 120 BPM
  - [x] Timer display, room code, beat indicator
- [x] Ably connection setup
- [x] Session state structure for patterns
- [x] Row states (greyed out vs. active)
- [x] Tone.js Transport running

### Phase 2: Drums ✅
- [x] Create `drums.template.html`:
  - [x] Sound selector (Kick, Snare, HiHat, Clap)
  - [x] 4×4 step grid
  - [x] Tap to place/remove/replace sounds
  - [x] Clear All button
  - [x] Beat indicator
- [x] Live mode: changes sent immediately
- [x] Host receives/stores drum patterns
- [x] Host renders drum pattern in grid
- [x] Host plays drum sounds on steps
- [x] Row flash animation on update
- [x] Player name display
- [x] Player disconnect handling

### Phase 3: Percussion ✅
- [x] Create `percussion.template.html` (same UI as drums)
- [x] Tone.js synths: Cowbell, Tambourine, Shaker, Conga Hi/Lo
- [x] Host handles multiple instruments
- [x] Audio mixing verified

### Phase 4: Chords ✅
- [x] Create `chords.template.html`:
  - [x] 4 chord slots (beats 1-4, 5-8, 9-12, 13-16)
  - [x] Tap to cycle: Am → F → C → G → Em → Dm
  - [x] "Send to Mix" button
  - [x] "In mix:" display
  - [x] Beat indicator
- [x] Draft vs. sent state
- [x] Host receives chord progressions
- [x] Host renders sustained chords
- [x] Host plays chords with sustain/release

### Phase 5: Bass ✅
- [x] Create `bass.template.html`:
  - [x] Two 8-column panels (steps 1-8, 9-16)
  - [x] 6 rows: A, G, F, E, D, C
  - [x] Tap to create/delete notes
  - [x] Swipe to create sustains
  - [x] Clear button
  - [x] "Send to Mix" button
- [x] Host receives bass patterns with durations
- [x] Host renders variable-length notes
- [x] Host plays bass with sustain/release

### Phase 6: Polish & Launch (In Progress)
- [x] Timer countdown (3:00 → 0:00)
- [x] "End Session" button
- [x] Lobby system (Open Room → Players Join → Start Session)
- [x] IP address override for localhost testing
- [x] Late joiner support (join mid-session)
- [x] Audio visualizer (pulsing gradient + particles)
- [x] Translucent UI for visualizer visibility
- [x] Master audio bus (compressor, limiter, reverb)
- [x] Audio mixing improvements
- [ ] End screen with survey link
- [ ] GA4 analytics events
- [x] Update README
- [x] Update CLAUDE.md
- [ ] Final user testing
- [ ] Merge to main

---

## V0 Completed Work (Reference)

The following was completed in V0 (tagged `v0`):

### Core Features
- [x] Real-time trigger-based jam session
- [x] 3 instruments: Drums, Bass, Chords
- [x] QR codes for phone joining
- [x] Hold-to-sustain for bass/chords
- [x] Drum quantization to 8th notes
- [x] Beat indicators on phones

### Infrastructure
- [x] Ably real-time messaging
- [x] Environment variable build script
- [x] Vercel deployment with auto-deploy
- [x] Google Analytics 4 integration
- [x] Restricted API keys for production

### Audio
- [x] Tone.js synths for all instruments
- [x] Stereo panning (kick center, snare left, hat right)
- [x] Volume balancing
- [x] Chord octave separation from bass

---

## Notes

- V1 is a significant rewrite; V0 code is archived for reference
- Test on real phones during development, not just browser resize
- Focus on "does it work" over "is it pretty" in early phases
