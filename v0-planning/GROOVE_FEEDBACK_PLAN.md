# Groove Meter & Feedback System - Technical Plan

## Overview

**Goal:** Add real-time feedback and meaningful end-session metrics to make the jam session experience more engaging, game-like, and rewarding.

**Problem Statement:** Currently, the app feels like random button mashing with no sense of progress, quality feedback, or achievement. Players don't know if they're "doing well" and the end screen metric (total notes played) is meaningless.

**Solution:** Implement a two-part feedback system:
1. **Real-time Groove Meter** - Visual indicator of how well the group is playing together
2. **Better End Screen Metrics** - Replace "notes played" with meaningful performance scores

**Status:** Planning Phase
**Target Implementation:** Feature branch → Testing → Main branch merge
**Estimated Effort:** 2-3 days with Claude Code assistance

---

## Feature 1: Real-Time Groove Meter

### Concept

A dynamic visual indicator on the **host screen** that shows how well the group is "locking in" musically. The meter fills/empties based on real-time analysis of playing patterns.

### Visual Design

**Primary Component: Groove Bar**
- Horizontal progress bar at top or bottom of host screen
- Width: Full screen or centered (800px)
- Height: 40-60px
- Colors: Gradient that shifts based on groove level
  - 0-25%: Red (#ff4444) - "Needs work"
  - 25-50%: Orange (#ff9944) - "Getting there"
  - 50-75%: Yellow (#ffdd44) - "Good groove"
  - 75-100%: Green (#44ff44) - "Locked in!"

**Secondary Visual Feedback:**
- Subtle background pulse when groove is high (75%+)
- Particle effects/stars when groove reaches 100%
- "LOCKED IN!" text flash when achieving sustained 100% groove

**Mobile Consideration:**
- Also show simplified groove indicator on player screens (optional)
- Small circular indicator in top corner
- Same color coding

### Scoring Algorithm

**Groove Score Calculation (0-100):**

```javascript
// Updated every 100ms
function calculateGrooveScore() {
  let score = 0;
  const now = Date.now();

  // Factor 1: Drummer Consistency (20 points)
  // Award points if drummer is maintaining steady rhythm
  if (drummerActive && (now - lastDrumHit) < 600) {
    // Check if drummer is consistent (last 4 hits within tempo tolerance)
    const drumConsistency = analyzeDrumConsistency();
    score += drumConsistency * 20; // 0.0 to 1.0 multiplier
  }

  // Factor 2: Ensemble Playing (20 points)
  // Award points when multiple instruments are active
  const activeInstruments = countActiveInstruments(now, 2000); // Last 2 seconds
  if (activeInstruments >= 2) score += 10;
  if (activeInstruments >= 3) score += 10; // Bonus for all three

  // Factor 3: Bass-Kick Sync (20 points)
  // Award points when bass notes land near kick drum hits
  const syncScore = calculateBassKickSync();
  score += syncScore * 20; // 0.0 to 1.0 multiplier

  // Factor 4: Sustained Activity (20 points)
  // Penalize long silences (no activity for > 2 seconds)
  const timeSinceLastNote = now - lastNoteTime;
  if (timeSinceLastNote < 1000) score += 20;
  else if (timeSinceLastNote < 2000) score += 10;
  else score += 0; // Silent for 2+ seconds

  // Factor 5: Musical Variety (20 points)
  // Award points for using different notes/chords (not just mashing same button)
  const varietyScore = calculateMusicalVariety();
  score += varietyScore * 20; // 0.0 to 1.0 multiplier

  return Math.min(100, Math.max(0, score));
}
```

**Smoothing:**
```javascript
// Smooth groove score to prevent jarring jumps
// Use exponential moving average
grooveScore = (grooveScore * 0.85) + (newScore * 0.15);
```

### Data Tracking Requirements

**New state variables to track:**

```javascript
// Drum consistency tracking
let drumHitTimes = []; // Last 8 drum hits with timestamps
let lastDrumHit = 0;

// Active instruments tracking
let lastNoteByInstrument = {
  drums: 0,
  bass: 0,
  chords: 0
};

// Bass-kick sync tracking
let recentKickHits = []; // Last 5 kick drum hits
let recentBassNotes = []; // Last 5 bass notes

// Variety tracking
let recentDrumNotes = {}; // {kick: 5, snare: 3, hat: 2, clap: 1}
let recentBassNotes = {}; // {C: 3, D: 2, E: 1, ...}
let recentChords = {};     // {Am: 5, F: 3, C: 2, ...}

// Groove score
let grooveScore = 0;
let grooveHistory = []; // For end-session stats
```

### Implementation Details

**File changes:**
- `host.template.html` - Add groove meter UI and scoring logic

**New functions to add:**

```javascript
function analyzeDrumConsistency() {
  // Analyze last 4-8 drum hits for tempo consistency
  // Return 0.0 to 1.0 based on how consistent the timing is
}

function countActiveInstruments(now, timeWindow) {
  // Count how many instruments played in the last timeWindow ms
}

function calculateBassKickSync() {
  // Check if recent bass notes happen within 100ms of kick hits
  // Return 0.0 to 1.0 based on sync quality
}

function calculateMusicalVariety() {
  // Check if player is using variety (not mashing same button)
  // Return 0.0 to 1.0 based on variety of notes used
}

function updateGrooveMeter(score) {
  // Update visual groove meter on host screen
  // Update color gradient based on score
  // Trigger visual effects if score is high
}

function trackNoteForGroove(instrument, note, timestamp) {
  // Called whenever a note is played
  // Updates all the tracking arrays for groove calculation
}
```

**Integration points:**
- Update `playDrum()`, `playBass()`, `playChord()` to call `trackNoteForGroove()`
- Add `setInterval()` to calculate groove score every 100ms
- Store groove history for end-session display

### Performance Considerations

- Groove calculation runs every 100ms - keep it lightweight
- Limit tracked arrays (last 5-10 items, not unbounded growth)
- Use circular buffers or array slicing to prevent memory leaks
- Disable groove calculation if not in active session

---

## Feature 2: Better End Screen Metrics

### Concept

Replace the meaningless "notes played" metric with a comprehensive performance breakdown that gives players a sense of how well they did and what to improve.

### Metrics to Display

**1. Overall Grade (A-F)**

Based on weighted combination of:
- Groove consistency (40%)
- Ensemble playing (30%)
- Individual participation (30%)

**Grading scale:**
- 90-100: A (Amazing!)
- 80-89: B (Great job!)
- 70-79: C (Good session)
- 60-69: D (Needs work)
- Below 60: F (Keep practicing!)

**2. Groove Consistency**

```
Groove Consistency: 73%
⭐⭐⭐⭐☆

Average groove score during session
Visual: Star rating (1-5 stars)
```

**3. Ensemble Playing Time**

```
Ensemble Playing: 2:15 / 3:00 (75%)
⭐⭐⭐⭐☆

Time when 2+ instruments were playing simultaneously
Visual: Time + percentage + stars
```

**4. Individual Performance Breakdown**

For each connected player:

```
🥁 Drums - Alex
   ⭐⭐⭐⭐⭐ (5/5)
   Consistent rhythm! Great groove.

🎸 Bass - Jordan
   ⭐⭐⭐⭐☆ (4/5)
   Good sync with drums. Play more!

🎹 Chords - Sam
   ⭐⭐⭐☆☆ (3/5)
   Try more variety in chord changes.
```

**Scoring per instrument:**
- **Drums:** Based on consistency + total hits + variety
- **Bass:** Based on kick sync + activity level + variety
- **Chords:** Based on activity level + variety + harmonic support

**5. Achievements Unlocked (Optional - Phase 1.5)**

Display any achievements earned during session:

```
🏆 Achievements Unlocked:
- Locked Groove (30 seconds straight at 90%+)
- Full Band (all 3 instruments active)
- Bass Master (50+ bass notes)
```

**6. Best Moment**

```
🌟 Best Moment: 1:24 - 1:34
   Peak groove: 98%
   All instruments locked in!
```

### Visual Design

**Layout:**

```
┌─────────────────────────────────────────┐
│          🎉 Session Complete!            │
│                                         │
│         Overall Grade: B+               │
│            ⭐⭐⭐⭐☆                        │
│                                         │
├─────────────────────────────────────────┤
│  Groove Consistency: 73%  ⭐⭐⭐⭐☆        │
│  Ensemble Playing: 2:15 / 3:00 (75%)   │
│  Best Moment: 1:24 - Peak groove 98%   │
├─────────────────────────────────────────┤
│  🥁 Drums - Alex        ⭐⭐⭐⭐⭐         │
│     Consistent rhythm! Great groove.    │
│                                         │
│  🎸 Bass - Jordan       ⭐⭐⭐⭐☆          │
│     Good sync with drums. Play more!    │
│                                         │
│  🎹 Chords - Sam        ⭐⭐⭐☆☆           │
│     Try more variety in chord changes.  │
├─────────────────────────────────────────┤
│  🏆 Achievements:                        │
│     ✓ Locked Groove                     │
│     ✓ Full Band                         │
├─────────────────────────────────────────┤
│   [📝 Share Feedback]  [Play Again]     │
└─────────────────────────────────────────┘
```

### Data Collection Requirements

**Track throughout session:**

```javascript
// Overall session stats
let sessionStats = {
  startTime: 0,
  endTime: 0,
  duration: 0,

  // Groove tracking
  grooveScoreSamples: [], // Sample every second
  averageGrooveScore: 0,
  peakGrooveScore: 0,
  peakGrooveTime: 0,

  // Ensemble stats
  ensemblePlayingTime: 0, // Seconds when 2+ instruments active

  // Per-instrument stats
  instruments: {
    drums: {
      name: 'Player Name',
      notesPlayed: 0,
      consistency: 0,      // 0-1
      variety: 0,          // 0-1
      starRating: 0,       // 1-5
      feedback: ''
    },
    bass: {
      name: 'Player Name',
      notesPlayed: 0,
      kickSyncScore: 0,    // 0-1
      activityLevel: 0,    // 0-1
      variety: 0,          // 0-1
      starRating: 0,       // 1-5
      feedback: ''
    },
    chords: {
      name: 'Player Name',
      notesPlayed: 0,
      activityLevel: 0,    // 0-1
      variety: 0,          // 0-1
      starRating: 0,       // 1-5
      feedback: ''
    }
  },

  // Achievements
  achievements: []
};
```

### Calculation Logic

**End of session calculations:**

```javascript
function calculateSessionStats() {
  // Calculate average groove
  sessionStats.averageGrooveScore =
    grooveHistory.reduce((a, b) => a + b, 0) / grooveHistory.length;

  // Calculate ensemble time
  // (Track in real-time when 2+ instruments active)

  // Calculate per-instrument scores
  sessionStats.instruments.drums.starRating =
    calculateDrumStars(sessionStats.instruments.drums);

  // etc...

  // Calculate overall grade
  const overallScore = (
    sessionStats.averageGrooveScore * 0.4 +
    (sessionStats.ensemblePlayingTime / sessionStats.duration) * 100 * 0.3 +
    averageParticipationScore() * 0.3
  );

  sessionStats.overallGrade = scoreToGrade(overallScore);

  // Check for achievements
  checkAchievements();
}

function calculateDrumStars(drumStats) {
  // Score based on consistency, variety, total notes
  const score = (
    drumStats.consistency * 40 +
    drumStats.variety * 30 +
    Math.min(drumStats.notesPlayed / 100, 1) * 30
  );
  return Math.ceil(score / 20); // Convert to 1-5 stars
}

// Similar for bass and chords...

function generateFeedback(instrument, stats) {
  // Generate encouraging, specific feedback
  // Examples:
  // - "Consistent rhythm! Great groove."
  // - "Good sync with drums. Try playing more!"
  // - "Excellent variety in chord changes!"
  // - "Keep the rhythm steady for better groove."

  // Use simple rules based on stats
}
```

### Implementation Details

**File changes:**
- `host.template.html` - Update end overlay with new metrics

**HTML changes:**
```html
<!-- Replace current end overlay stats section -->
<div class="session-stats">
  <div class="overall-grade">
    <h2 id="overallGrade">B+</h2>
    <div class="stars" id="overallStars">⭐⭐⭐⭐☆</div>
  </div>

  <div class="stat-row">
    <span class="stat-label">Groove Consistency:</span>
    <span id="grooveConsistency">73%</span>
    <span id="grooveStars">⭐⭐⭐⭐☆</span>
  </div>

  <div class="stat-row">
    <span class="stat-label">Ensemble Playing:</span>
    <span id="ensembleTime">2:15 / 3:00 (75%)</span>
  </div>

  <div class="stat-row">
    <span class="stat-label">Best Moment:</span>
    <span id="bestMoment">1:24 - Peak groove 98%</span>
  </div>

  <div class="player-stats" id="playerStats">
    <!-- Dynamically generated per player -->
  </div>

  <div class="achievements" id="achievements">
    <!-- Dynamically generated if any unlocked -->
  </div>
</div>
```

**CSS additions:**
- Star rating styles
- Grade display styles
- Stat row layouts
- Player breakdown cards

---

## Development Workflow

### Feature Branch Strategy

**Why use a feature branch:**
- This is a substantial feature (not a bug fix)
- Requires testing and iteration
- May need to be rolled back if issues arise
- Good practice for future development
- Allows parallel work on other features/fixes

**Branch naming convention:**
```
feature/groove-meter-feedback
```

### Development Steps

**1. Create Feature Branch**
```bash
git checkout main
git pull origin main
git checkout -b feature/groove-meter-feedback
```

**2. Development Cycle**
```bash
# Make changes
# Test locally
# Commit frequently with clear messages
git add <files>
git commit -m "Add groove score calculation logic"

# Push to remote feature branch
git push origin feature/groove-meter-feedback
```

**3. Keep Feature Branch Updated**
```bash
# Periodically sync with main (if main gets updates)
git checkout main
git pull origin main
git checkout feature/groove-meter-feedback
git merge main
# Resolve any conflicts
git push origin feature/groove-meter-feedback
```

**4. Testing Phase**
```bash
# Deploy feature branch to Vercel preview (automatic on PR)
# Test with multiple devices
# Gather feedback
# Make refinements
# Commit and push updates
```

**5. Merge to Main**
```bash
# When feature is complete and tested:
git checkout main
git pull origin main
git merge feature/groove-meter-feedback
git push origin main
# Delete feature branch
git branch -d feature/groove-meter-feedback
git push origin --delete feature/groove-meter-feedback
```

### Vercel Preview Deployments

Vercel automatically creates preview deployments for pull requests:
- Create PR from `feature/groove-meter-feedback` → `main`
- Vercel deploys to preview URL (e.g., `jam-mvp-git-feature-groove-meter-*.vercel.app`)
- Test on preview URL
- Iterate until satisfied
- Merge PR to deploy to production

---

## Implementation Plan

### Phase 1: Groove Meter (Days 1-2)

**Day 1 - Morning:**
- ✅ Create feature branch
- ✅ Add state variables for tracking (drumHitTimes, grooveScore, etc.)
- ✅ Implement `trackNoteForGroove()` function
- ✅ Integrate tracking into playDrum/playBass/playChord

**Day 1 - Afternoon:**
- ✅ Implement scoring algorithm helper functions:
  - `analyzeDrumConsistency()`
  - `countActiveInstruments()`
  - `calculateBassKickSync()`
  - `calculateMusicalVariety()`
- ✅ Implement main `calculateGrooveScore()` function
- ✅ Add `setInterval()` to calculate score every 100ms

**Day 2 - Morning:**
- ✅ Design and add groove meter UI to host screen
- ✅ Implement `updateGrooveMeter(score)` visual update
- ✅ Add CSS for groove meter (colors, animations)
- ✅ Test groove calculation with different play patterns

**Day 2 - Afternoon:**
- ✅ Add visual effects (screen pulse, particles, "LOCKED IN!" text)
- ✅ Test with multiple players
- ✅ Refine scoring weights based on feel
- ✅ Add comments and clean up code

### Phase 2: Better End Screen (Day 3)

**Day 3 - Morning:**
- ✅ Implement session stats tracking
- ✅ Add `calculateSessionStats()` function
- ✅ Implement per-instrument scoring functions
- ✅ Implement feedback generation logic

**Day 3 - Afternoon:**
- ✅ Update end screen HTML with new layout
- ✅ Add CSS for new end screen design
- ✅ Implement stats display logic in `endSession()`
- ✅ Test end screen with various scenarios

### Phase 3: Testing & Refinement

**Testing checklist:**
- [ ] Solo play (1 player) - does groove meter make sense?
- [ ] Duo play (2 players) - proper ensemble detection?
- [ ] Full band (3 players) - all scores accurate?
- [ ] Random mashing - low scores as expected?
- [ ] Good groove - high scores as expected?
- [ ] End screen displays correctly for all scenarios
- [ ] Mobile player screens still work correctly
- [ ] No performance issues (lag, memory leaks)
- [ ] Works on different browsers
- [ ] Works on different devices (desktop, tablet, phone)

**Refinement areas:**
- Adjust scoring weights if groove meter feels wrong
- Tweak thresholds for grades (A-F)
- Refine feedback messages
- Polish visual effects
- Optimize performance if needed

### Phase 4: Deployment

- [ ] Create pull request from feature branch
- [ ] Review code and test on Vercel preview
- [ ] Get user feedback on preview deployment
- [ ] Make final adjustments
- [ ] Merge to main
- [ ] Monitor production for issues
- [ ] Delete feature branch

---

## Testing Strategy

### Local Testing

**Test scenarios:**

1. **No players:** Groove meter should be at 0
2. **One drummer only:** Test if consistency detection works
3. **Drummer + bass:** Test kick-bass sync detection
4. **All three instruments:** Test ensemble playing detection
5. **Random mashing:** Should result in low groove scores
6. **Intentional good playing:** Should result in high scores
7. **Silence periods:** Groove meter should drop
8. **End session:** Stats should be accurate and meaningful

### Multi-Device Testing

**Setup:**
- Host on laptop/TV
- 3 phones with different instruments
- Test all scoring factors

**What to verify:**
- Groove meter updates in real-time
- Visual effects trigger appropriately
- End screen shows correct stats for all players
- No lag or performance issues

---

## Success Metrics

**User experience goals:**
- ✅ Players understand what makes "good" playing
- ✅ Real-time feedback is encouraging and accurate
- ✅ End screen feels rewarding and informative
- ✅ Players want to "beat their high score"
- ✅ The experience feels more game-like and engaging

**Technical goals:**
- ✅ Groove calculation runs smoothly (no lag)
- ✅ Scoring feels fair and accurate
- ✅ Visual feedback is clear and motivating
- ✅ No bugs or edge cases

---

## Future Enhancements (Post-MVP)

These are out of scope for Phase 1 but documented for future consideration:

### Achievement System
- Define ~10-15 achievements
- Track progress toward achievements
- Unlock rewards (new sounds, visual themes)
- Share achievements on social media

### Challenge Mode
- Pre-defined patterns to follow
- Guitar Hero style gameplay
- Progressive difficulty levels
- Leaderboards

### AI-Powered Analysis
- Audio analysis for advanced feedback
- Personalized coaching tips
- Genre detection
- Comparison to "professional" patterns

### Multiplayer Features
- Compare scores with other sessions
- Global leaderboards
- Battle mode (competitive scoring)
- Cooperative challenges

---

## Open Questions / Decisions Needed

1. **Groove Meter placement:** Top or bottom of screen?
2. **Visual style:** Minimalist or animated/gamified?
3. **Player screen indicators:** Show groove meter on phones too?
4. **Achievements in Phase 1:** Include basic achievements or save for Phase 2?
5. **Grading strictness:** Should it be easy to get an A or challenging?
6. **Feedback tone:** Encouraging vs critical? Always positive or honest critique?

---

## Risk Assessment

**Low Risk:**
- Pure additive feature (doesn't change existing functionality)
- Feature branch allows safe testing
- Can disable if issues arise

**Medium Risk:**
- Performance impact of 100ms calculation interval
- Scoring algorithm may need iteration based on user feedback
- Visual effects might be distracting

**Mitigation:**
- Thorough performance testing
- Make groove meter optional/toggleable (future setting)
- A/B test with users before finalizing
- Keep calculations lightweight

---

## Rollback Plan

If major issues arise after deployment:

1. **Quick fix:** Set `ENABLE_GROOVE_METER = false` flag
2. **Revert commit:** `git revert <commit-hash>`
3. **Hotfix branch:** Fix critical bug in separate branch
4. **Re-deploy:** Push fix to production

---

## Notes

- Keep scoring algorithm simple and transparent
- Prioritize fun and encouragement over strict accuracy
- Iterate based on user feedback
- Document any magic numbers (thresholds, weights) for future tuning
