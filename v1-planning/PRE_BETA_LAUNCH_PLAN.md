# Pre-Beta Launch Implementation Plan

## Overview
Prepare Jam Session V1 for beta testing with analytics, survey, social sharing, landing page, and documentation.

---

## Task 1: GA4 Analytics Review & Update

**Status:** Partially implemented, needs V1-specific events

**Files to modify:**
- `host.template.html` (lines 28-49 for GA4 setup, various locations for events)
- `drums.template.html`, `percussion.template.html`, `bass.template.html`, `chords.template.html`

**Current events tracked:**
- `session_created`, `lobby_opened`, `player_joined`, `session_started`, `session_ended`

**Events to add/verify:**
- `pattern_update` - when player sends pattern to mix (instrument, step count)
- `late_join` - when player joins mid-session
- `play_again` - when host clicks Play Again

**Implementation:**
1. Verify all current events fire correctly in V1 flow
2. Add `pattern_update` event in player templates when "Send to Mix" clicked
3. Add `late_join` event in host when player joins during active session
4. Add `play_again` event in host end screen

---

## Task 2: Create V1 Survey & Add Links to End Screens

**Files to modify:**
- `host.template.html` (lines 809-826, end overlay section)
- `drums.template.html` (lines 378-382)
- `percussion.template.html` (lines 382-386)
- `bass.template.html` (lines 449-453)
- `chords.template.html` (lines 435-439)

**New survey questions (V1 focused):**

### Section 1: About You
1. First name (optional)
2. Age range
3. Musical experience level

### Section 2: The Experience
4. How fun was building patterns together? (1-5 scale)
5. Did the loop sound good? (1-5 scale)
6. Was it easy to understand what to do? (1-5 scale)
7. Which instrument did you play?
8. How many people were in your session?

### Section 3: Specifics
9. What was the best part?
10. What was frustrating or confusing?
11. Would you play again? (Yes/Maybe/No)
12. Would you recommend to friends? (1-10 NPS)

### Section 4: Technical
13. What device did you use? (iPhone/Android/Other)
14. Any bugs or issues?

### Section 5: Follow-up
15. Email for updates (optional)

**Implementation:**
1. User creates new Google Form with above questions
2. Get new survey URL
3. Update `SURVEY_QUESTIONS.md` with new questions
4. Add survey button to host end overlay:
   ```html
   <a href="[SURVEY_URL]" target="_blank" class="survey-btn" onclick="trackEvent('survey_clicked', {source: 'host_end_screen'})">
     Share Feedback (2 min)
   </a>
   ```
5. Add survey button to each player template end screen with matching styling
6. Add CSS for survey button (cyan gradient, matches existing button styles)

---

## Task 3: Update Social Sharing Metadata

**Files to modify:**
- `host.template.html` (lines 8-22)
- `drums.template.html`, `percussion.template.html`, `bass.template.html`, `chords.template.html`
- Create: `social-share.png` (1200x630px recommended for og:image)

**Implementation:**
1. Create social share image (can be simple: logo + "Jam Session - Build beats together!")
2. Add to all templates:
   ```html
   <meta property="og:image" content="https://jam-mvp-xi.vercel.app/social-share.png">
   <meta property="twitter:image" content="https://jam-mvp-xi.vercel.app/social-share.png">
   ```
3. Update descriptions for V1:
   - "Build beats together! A collaborative 16-step sequencer where everyone contributes to the loop."

---

## Task 4: Create Landing Page (index.html) with Mobile Warning

**Files to modify:**
- Create: `index.template.html` (new landing page template)
- `build.py` (line 113, change output mapping)

**Implementation:**

Create `index.template.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Jam Session</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Social meta tags -->
</head>
<body>
    <div class="container">
        <h1>Jam Session</h1>
        <p>A multiplayer music party game</p>

        <!-- Mobile warning (shown via CSS/JS on small screens) -->
        <div class="mobile-warning" id="mobileWarning">
            <p>This app works best on a large screen (laptop/TV).</p>
            <p>Open this link on a computer to host a jam session,
               then players can join from their phones.</p>
        </div>

        <!-- Desktop CTA -->
        <div class="desktop-cta" id="desktopCta">
            <a href="/host.html" class="start-btn">Start Hosting</a>
        </div>
    </div>

    <script>
        // Detect mobile and show appropriate content
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        || window.innerWidth < 768;
        document.getElementById('mobileWarning').style.display = isMobile ? 'block' : 'none';
        document.getElementById('desktopCta').style.display = isMobile ? 'none' : 'block';
    </script>
</body>
</html>
```

Update `build.py` line 113:
```python
('index.template.html', 'index.html'),  # Landing page
('host.template.html', 'host.html'),    # Full host (no longer index.html)
```

---

## Task 5: Add Version Indicator

**Files to modify:**
- `host.template.html`
- All player templates

**Implementation:**
Add small version badge in corner:
```html
<div class="version-badge">v1.0-beta</div>
```
```css
.version-badge {
    position: fixed;
    bottom: 8px;
    right: 8px;
    font-size: 10px;
    color: rgba(255,255,255,0.3);
}
```

---

## Task 6: Audio Recording Technical Plan (Deferred)

**Not for beta - document for future implementation**

Create: `v1-planning/AUDIO_RECORDING_SPEC.md`

**Technical approach:**
1. Use `Tone.Recorder` class
2. Insert after master limiter, before analyser
3. Start recording when session starts
4. Stop and encode when session ends
5. Offer download as WAV (or MP3 via external encoder)

**Code pattern:**
```javascript
const recorder = new Tone.Recorder();
masterLimiter.connect(recorder);

// On session start
await recorder.start();

// On session end
const recording = await recorder.stop();
const url = URL.createObjectURL(recording);
// Create download link
```

**Considerations:**
- File size: ~10MB/minute for WAV
- Browser support: Good in Chrome/Safari
- Memory usage: Needs monitoring for long sessions

---

## Task 7: Short URL Setup (Manual)

**User action required:**
1. Choose short URL service (bit.ly, rebrandly, or custom domain)
2. Create redirect: `[short-url]` → `https://jam-mvp-xi.vercel.app`
3. Document in README.md

---

## Task 8: Documentation Updates

**Files to modify:**
- `README.md` - Add beta testing instructions, short URL
- `SURVEY_QUESTIONS.md` - Update with new V1 survey questions
- `TODO.md` - Mark completed items, add remaining tasks

---

## Implementation Order

1. **Task 4: Landing page** - Create index.template.html, update build.py
2. **Task 2: Survey** - User creates form, then add links to all end screens
3. **Task 3: Social metadata** - Create image, update meta tags
4. **Task 1: GA4** - Add missing events, verify existing ones
5. **Task 5: Version badge** - Quick addition to all templates
6. **Task 6: Recording spec** - Write technical doc (no code)
7. **Task 7: Short URL** - User sets up manually
8. **Task 8: Documentation** - Final updates

---

## Files Summary

| File | Changes |
|------|---------|
| `index.template.html` | CREATE - New landing page with mobile warning |
| `host.template.html` | Survey link, version badge, verify GA4 events |
| `drums.template.html` | Survey link, social meta, version badge |
| `percussion.template.html` | Survey link, social meta, version badge |
| `bass.template.html` | Survey link, social meta, version badge |
| `chords.template.html` | Survey link, social meta, version badge |
| `build.py` | Update output mapping for index.html |
| `social-share.png` | CREATE - Social sharing image |
| `v1-planning/AUDIO_RECORDING_SPEC.md` | CREATE - Technical spec for future |
| `SURVEY_QUESTIONS.md` | Update with V1 questions |
| `README.md` | Add beta testing info |
| `TODO.md` | Update task status |
