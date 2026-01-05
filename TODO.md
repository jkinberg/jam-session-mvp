# TODO - Jam Session

## Current Focus: V1 Sequencer

**Branch:** `feature/v1-sequencer`
**Spec:** `v1-planning/V1_SEQUENCER_SPEC.md`

---

## V1 Implementation Checklist

### Phase 1: Foundation & Infrastructure
- [ ] Archive V0 templates to `archive/` directory
- [ ] Update `build.py` to generate multiple HTML files
- [ ] Create new `host.template.html`:
  - [ ] 4 instrument rows (drums, percussion, bass, chords)
  - [ ] QR codes with instrument-specific URLs
  - [ ] 16-step grid visualization per row
  - [ ] Playhead animation at 120 BPM
  - [ ] Timer display, room code, beat indicator
- [ ] Ably connection setup
- [ ] Session state structure for patterns
- [ ] Row states (greyed out vs. active)
- [ ] Tone.js Transport running (no audio yet)

### Phase 2: Drums
- [ ] Create `drums.template.html`:
  - [ ] Sound selector (Kick, Snare, HiHat, Clap)
  - [ ] 4×4 step grid
  - [ ] Tap to place/remove/replace sounds
  - [ ] Clear All button
  - [ ] Beat indicator
- [ ] Live mode: changes sent immediately
- [ ] Host receives/stores drum patterns
- [ ] Host renders drum pattern in grid
- [ ] Host plays drum sounds on steps
- [ ] Row flash animation on update
- [ ] Player name display
- [ ] Player disconnect handling

### Phase 3: Percussion
- [ ] Create `percussion.template.html` (same UI as drums)
- [ ] Tone.js synths: Cowbell, Tambourine, Shaker, Conga
- [ ] Host handles multiple instruments
- [ ] Verify audio mixing

### Phase 4: Chords
- [ ] Create `chords.template.html`:
  - [ ] 4 chord slots (beats 1-4, 5-8, 9-12, 13-16)
  - [ ] Tap to cycle: Am → F → C → G → Am...
  - [ ] "Send to Mix" button
  - [ ] "In mix:" display
  - [ ] Beat indicator
- [ ] Draft vs. sent state
- [ ] Host receives chord progressions
- [ ] Host renders sustained chords
- [ ] Host plays chords with sustain/release

### Phase 5: Bass
- [ ] Create `bass.template.html`:
  - [ ] Two 8-column panels (steps 1-8, 9-16)
  - [ ] 6 rows: A, G, F, E, D, C
  - [ ] Tap to create/delete notes
  - [ ] Clear button
  - [ ] "Send to Mix" button
- [ ] Host receives bass patterns with durations
- [ ] Host renders variable-length notes
- [ ] Host plays bass with sustain/release

### Phase 6: Polish & Launch
- [ ] Timer countdown (3:00 → 0:00)
- [ ] "End Session" button
- [ ] End screen with survey link
- [ ] Visual polish (colors, animations, effects)
- [ ] Mobile testing
- [ ] TV/large screen testing
- [ ] Analytics events (GA4)
- [ ] Update README
- [ ] Update CLAUDE.md
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

## Deferred (Post-V1)

These items are from V0 planning and may be revisited after V1:

- [ ] Groove meter & feedback system
- [ ] Master effects chain (reverb, compressor, limiter)
- [ ] WebRTC migration (less critical for pattern-based approach)
- [ ] Session recording/playback
- [ ] Challenge/tutorial mode
- [ ] Additional instruments (melody synth, FX controller)
- [ ] Tempo adjustment control
- [ ] Social sharing image

---

## Notes

- V1 is a significant rewrite; V0 code is archived for reference
- Each phase should be committed and pushed before moving to next
- Test on real phones during development, not just browser resize
- Prioritize "does it work" over "is it pretty" in early phases
