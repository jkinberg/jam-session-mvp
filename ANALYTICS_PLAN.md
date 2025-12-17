# Analytics Integration Plan

## Overview

Add Google Analytics 4 (GA4) to track **product validation metrics** for the Jam Session MVP. Focus on understanding:
- Are people completing sessions?
- How many players join per session?
- Are there technical issues blocking usage?
- Are users engaging with the survey?

**Philosophy:** Track product health and validation, not detailed user behavior.

---

## Key Product Validation Metrics

### 1. Session Health
- **Total sessions created** - Overall usage volume
- **Session completion rate** - % of sessions that run to completion vs early exit
- **Average session duration** - How long do sessions actually run?
- **Sessions with players** - % of sessions where at least 1 player joined

### 2. Player Engagement
- **Players per session** - Distribution (0, 1, 2, 3, 4+ players)
- **Instrument distribution** - Which instruments are chosen most often?
- **Time to first player** - How long before someone joins after room creation?

### 3. Technical Health
- **Connection failures** - Players who tried but failed to connect
- **High latency warnings** - Sessions experiencing sync issues
- **Browser/device distribution** - What platforms are being used?
- **Errors encountered** - Any JavaScript errors or failures

### 4. Survey Engagement
- **Survey link clicks from host** - QR code or button clicks
- **Survey link clicks from player** - Button clicks on phone end screen
- **Survey conversion rate** - Sessions → Survey clicks

---

## Events to Track

### Host Screen Events

#### Core Session Events
```javascript
// When host screen loads and generates room code
gtag('event', 'session_created', {
  room_code: '[ROOM_CODE]', // For debugging, not PII
  timestamp: Date.now()
});

// When "START HOST" button is clicked
gtag('event', 'session_started', {
  room_code: '[ROOM_CODE]',
  player_count: 0 // Initial count
});

// When session ends (timer expires OR early exit button)
gtag('event', 'session_ended', {
  room_code: '[ROOM_CODE]',
  completion_type: 'completed' | 'ended_early',
  duration_seconds: 180,
  total_players: 3,
  instruments: {
    drums: 1,
    bass: 1,
    chords: 1
  }
});
```

#### Player Join Events
```javascript
// When a player successfully joins
gtag('event', 'player_joined', {
  room_code: '[ROOM_CODE]',
  instrument: 'drums' | 'bass' | 'chords',
  player_count: 1 // New total
});
```

#### Survey Events
```javascript
// When survey QR code or button is clicked on host
gtag('event', 'survey_clicked', {
  source: 'host_end_screen',
  room_code: '[ROOM_CODE]'
});
```

#### Error Events
```javascript
// When Ably connection fails
gtag('event', 'connection_error', {
  error_type: 'ably_connection_failed',
  error_message: '[ERROR]',
  screen: 'host'
});
```

### Player Screen Events

#### Connection Events
```javascript
// When player screen loads successfully
gtag('event', 'player_loaded', {
  instrument: 'drums' | 'bass' | 'chords',
  room_code: '[ROOM_CODE]'
});

// When player successfully connects to Ably
gtag('event', 'player_connected', {
  instrument: 'drums' | 'bass' | 'chords',
  room_code: '[ROOM_CODE]'
});
```

#### Survey Events
```javascript
// When survey button is clicked on player end screen
gtag('event', 'survey_clicked', {
  source: 'player_end_screen',
  instrument: 'drums' | 'bass' | 'chords',
  room_code: '[ROOM_CODE]'
});
```

#### Error Events
```javascript
// Connection failures
gtag('event', 'connection_error', {
  error_type: 'ably_connection_failed',
  error_message: '[ERROR]',
  screen: 'player',
  instrument: 'drums' | 'bass' | 'chords'
});
```

---

## Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to https://analytics.google.com
2. Create a new account (or use existing)
3. Create a new **GA4 Property** (not Universal Analytics)
4. Get your **Measurement ID** (format: `G-XXXXXXXXXX`)
5. No need to set up "enhanced measurement" - we'll track custom events

### Step 2: Add GA4 Script to Templates

Add to both `host.template.html` and `play.template.html` in the `<head>` section:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // Configure with anonymization
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false
  });
</script>
```

### Step 3: Store Measurement ID in Environment Variables

Add to `.env`:
```bash
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Add to `.env.example`:
```bash
# Google Analytics 4 (optional - for analytics tracking)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Add placeholder to templates:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=__GA4_MEASUREMENT_ID__"></script>
```

Update `build.py` to replace `__GA4_MEASUREMENT_ID__` placeholder.

### Step 4: Add Privacy Notice (Optional but Recommended)

Add a simple notice to both screens:

```html
<div style="position: fixed; bottom: 10px; right: 10px; font-size: 10px; color: rgba(255,255,255,0.5);">
  We use analytics to improve this app. <a href="#" style="color: rgba(255,255,255,0.7);">Learn more</a>
</div>
```

Or create a simple modal on first load explaining data collection.

---

## Privacy Configuration

### GA4 Settings to Enable:
- ✅ **IP Anonymization** - Enabled in config above
- ✅ **Disable Google Signals** - No cross-device tracking
- ✅ **Disable Ad Personalization** - No ad targeting

### Data Retention Settings:
- Set data retention to **2 months** (minimum) in GA4 settings
- This is an MVP - you don't need long-term user data

### What We're NOT Tracking:
- ❌ User identities (no names, emails)
- ❌ Personal information
- ❌ Cross-site activity
- ❌ Detailed musical behavior (note counts, rhythms, etc.)

### Cookie Consent:
For MVP testing in the US, you can probably skip cookie consent banners. If you expand to EU users, you'll need:
- Cookie consent banner
- Opt-in before tracking
- Privacy policy page

---

## Implementation Checklist

### Setup Phase
- [ ] Create Google Analytics 4 property
- [ ] Get Measurement ID (G-XXXXXXXXXX)
- [ ] Add `GA4_MEASUREMENT_ID` to `.env` and Vercel environment variables
- [ ] Add `GA4_MEASUREMENT_ID` to `.env.example` with instructions
- [ ] Update `build.py` to replace `__GA4_MEASUREMENT_ID__` placeholder

### Code Integration - Host Screen
- [ ] Add GA4 script to `host.template.html` `<head>`
- [ ] Track `session_created` on page load
- [ ] Track `session_started` when START HOST clicked
- [ ] Track `player_joined` when receiving join messages
- [ ] Track `session_ended` with completion type and metrics
- [ ] Track `survey_clicked` on survey link clicks
- [ ] Track `connection_error` on Ably failures

### Code Integration - Player Screen
- [ ] Add GA4 script to `play.template.html` `<head>`
- [ ] Track `player_loaded` on page load
- [ ] Track `player_connected` when Ably connects successfully
- [ ] Track `survey_clicked` on survey button clicks
- [ ] Track `connection_error` on failures

### Testing
- [ ] Test locally with GA4 DebugView (real-time event viewer)
- [ ] Verify events show up in GA4 dashboard
- [ ] Test on multiple devices (desktop, mobile)
- [ ] Verify room codes and metrics are captured correctly

### Documentation
- [ ] Update README with analytics mention
- [ ] Add analytics toggle instructions (if implementing opt-out)
- [ ] Update CLAUDE.md with analytics event locations

---

## GA4 Dashboard Configuration

### Recommended Custom Reports

**1. Session Health Report**
- Total sessions created
- Session completion rate
- Average duration
- Sessions with players (%)

**2. Player Engagement Report**
- Total players
- Players per session (distribution)
- Instrument distribution (pie chart)
- Time to first player (average)

**3. Technical Health Report**
- Connection errors (count)
- Error rate (% of sessions)
- Browser/device breakdown
- Geographic distribution

**4. Survey Conversion Report**
- Survey clicks from host
- Survey clicks from players
- Survey conversion rate (sessions → clicks)

### Custom Dimensions to Create in GA4:
- `room_code` - String
- `instrument` - String
- `completion_type` - String
- `player_count` - Number
- `error_type` - String

---

## Future Enhancements (Post-MVP)

- [ ] Add A/B testing framework for feature experiments
- [ ] Track WebRTC latency metrics (when implemented)
- [ ] Funnel analysis: QR scan → join → play → survey
- [ ] Cohort analysis: First-time vs returning users
- [ ] Integration with backend analytics (if adding server)

---

## Expected Insights

After 1-2 weeks of data collection, you should be able to answer:

1. **Product-Market Fit:**
   - Are sessions completing? (Target: >70% completion rate)
   - Are people playing with friends? (Target: >2 players per session)

2. **Technical Validation:**
   - Is the app working reliably? (Target: <5% error rate)
   - What devices/browsers are people using?

3. **Survey Effectiveness:**
   - Are users clicking the survey? (Target: >20% conversion)
   - Which screen drives more survey engagement? (Host vs Player)

4. **Instrument Popularity:**
   - Which instruments are most/least popular?
   - Should we prioritize certain instruments for improvement?

---

## Notes

- **Room codes are temporary** - They're not PII, safe to track for debugging
- **Keep it simple** - This is an MVP, don't over-track
- **Review after 2 weeks** - See what metrics are actually useful
- **Consider removing events** that don't provide value
