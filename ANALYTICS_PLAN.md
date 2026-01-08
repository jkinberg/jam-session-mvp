# Analytics Integration Plan

**Status:** Revision for V1 (January 2025)

---

## Overview

Google Analytics 4 (GA4) tracking for Jam Session V1 (Sequencer). Focus on **product validation metrics** to understand:
- Are people completing sessions?
- How many players join per session?
- Is the lobby flow working?
- Are there technical issues blocking usage?
- Are users engaging with the survey?

**Philosophy:** Track product health and validation, not detailed user behavior.

**V1 Architecture Changes from V0:**
- Lobby system: Open Room → Players Join → Start Session
- 4 separate instrument files (drums, percussion, bass, chords) instead of single play.html
- Pattern-based sequencer instead of real-time triggers
- Late joiner support

---

## Key Product Validation Metrics

### 1. Session Health
- **Total sessions created** - Overall usage volume
- **Lobby → Start conversion** - % of rooms that actually start a jam
- **Session completion rate** - % of sessions that run to completion vs early exit
- **Average session duration** - How long do sessions actually run?
- **Sessions with players** - % of sessions where at least 1 player joined

### 2. Player Engagement
- **Players per session** - Distribution (0, 1, 2, 3, 4 players)
- **Instrument distribution** - Which instruments are chosen most often?
- **Pattern activity** - Are players actively sending patterns? (chords/bass)

### 3. Technical Health
- **Connection failures** - Players who tried but failed to connect
- **Browser/device distribution** - What platforms are being used?
- **Errors encountered** - Any JavaScript errors or failures

### 4. Survey Engagement
- **Survey link clicks from host** - QR code or link clicks
- **Survey link clicks from players** - Button clicks on phone end screen
- **Survey conversion rate** - Sessions → Survey clicks

---

## V1 Events Specification

### Landing Page Events (`index.template.html`)

```javascript
// Desktop: User clicks Continue to proceed to host screen
trackEvent('landing_continue_clicked');

// Mobile: User visits landing page on mobile device
trackEvent('landing_mobile_detected');

// Mobile: User copies the URL
trackEvent('landing_url_copied');

// Mobile: User shares via native share dialog
trackEvent('landing_url_shared');
```

---

### Host Screen Events (`host.template.html`)

#### Session Lifecycle Events

```javascript
// Room created (page load, room code generated)
trackEvent('session_created', {
  room_code: 'XK7M'
});

// Host opens the lobby (clicks "Open Room")
trackEvent('lobby_opened', {
  room_code: 'XK7M'
});

// Session starts (clicks "Start Jam Session")
trackEvent('session_started', {
  room_code: 'XK7M',
  player_count: 3  // Players in lobby at start
});

// Session ends (timer expires or early exit)
trackEvent('session_ended', {
  room_code: 'XK7M',
  completion_type: 'completed' | 'ended_early',
  duration_seconds: 180,
  total_loops: 24,
  total_players: 3
});
```

#### Player Events (tracked on host when receiving messages)

```javascript
// Player joins the session
trackEvent('player_joined', {
  instrument: 'drums' | 'percussion' | 'bass' | 'chords',
  room_code: 'XK7M'
});
```

#### Survey Events

```javascript
// Survey link clicked on end screen
trackEvent('survey_clicked', {
  source: 'host_end_screen',
  room_code: 'XK7M'
});
```

#### Error Events

```javascript
// Ably connection failure
trackEvent('connection_error', {
  error: 'ably_failed'
});
```

---

### Instrument Screen Events

Each instrument template (drums, percussion, bass, chords) tracks the same events with instrument-specific parameters.

#### Connection Events

```javascript
// Page loaded successfully
trackEvent('player_loaded', {
  instrument: 'drums' | 'percussion' | 'bass' | 'chords',
  room_code: 'XK7M'
});

// Successfully connected to Ably
trackEvent('player_connected', {
  instrument: 'drums' | 'percussion' | 'bass' | 'chords',
  room_code: 'XK7M'
});
```

#### Pattern Events (chords and bass only - draft mode instruments)

```javascript
// Pattern sent to mix (chords)
trackEvent('pattern_sent', {
  instrument: 'chords',
  room_code: 'XK7M',
  chord_count: 4
});

// Pattern sent to mix (bass)
trackEvent('pattern_sent', {
  instrument: 'bass',
  room_code: 'XK7M',
  note_count: 6
});
```

Note: Drums and percussion use "live mode" where changes are sent immediately, so we don't track individual pattern sends for those instruments.

#### Survey Events

```javascript
// Survey link clicked on end screen
trackEvent('survey_clicked', {
  source: 'player_end_screen',
  instrument: 'drums' | 'percussion' | 'bass' | 'chords',
  room_code: 'XK7M'
});
```

#### Error Events

```javascript
// Ably connection failure
trackEvent('connection_error', {
  error: 'ably_failed'
});
```

---

## Implementation Status

### Host Screen (`host.template.html`)

| Event | Status | Notes |
|-------|--------|-------|
| `session_created` | ✅ Implemented | On room code generation |
| `lobby_opened` | ✅ Implemented | On "Open Room" click |
| `session_started` | ✅ Implemented | Includes player_count at start |
| `session_ended` | ✅ Implemented | Includes completion_type, duration, loops, players |
| `player_joined` | ✅ Implemented | Tracks instrument type |
| `survey_clicked` | ✅ Implemented | On survey link click |
| `connection_error` | ✅ Implemented | Ably failures |

### Drums (`drums.template.html`)

| Event | Status | Notes |
|-------|--------|-------|
| `player_loaded` | ✅ Implemented | |
| `player_connected` | ✅ Implemented | |
| `survey_clicked` | ✅ Implemented | On survey link click |
| `connection_error` | ✅ Implemented | |

### Percussion (`percussion.template.html`)

| Event | Status | Notes |
|-------|--------|-------|
| `player_loaded` | ✅ Implemented | |
| `player_connected` | ✅ Implemented | |
| `survey_clicked` | ✅ Implemented | On survey link click |
| `connection_error` | ✅ Implemented | |

### Bass (`bass.template.html`)

| Event | Status | Notes |
|-------|--------|-------|
| `player_loaded` | ✅ Implemented | |
| `player_connected` | ✅ Implemented | |
| `pattern_sent` | ✅ Implemented | Includes note_count |
| `survey_clicked` | ✅ Implemented | On survey link click |
| `connection_error` | ✅ Implemented | |

### Chords (`chords.template.html`)

| Event | Status | Notes |
|-------|--------|-------|
| `player_loaded` | ✅ Implemented | |
| `player_connected` | ✅ Implemented | |
| `pattern_sent` | ✅ Implemented | Includes chord_count |
| `survey_clicked` | ✅ Implemented | On survey link click |
| `connection_error` | ✅ Implemented | |

---

## Remaining Implementation Tasks

### Priority 1: Survey Tracking ✅ Complete
- [x] Add `survey_clicked` event to host end screen link
- [x] Add `survey_clicked` event to drums end screen link
- [x] Add `survey_clicked` event to percussion end screen link
- [x] Add `survey_clicked` event to bass end screen link
- [x] Add `survey_clicked` event to chords end screen link

### Priority 2: Testing & Validation
- [ ] Test locally with GA4 DebugView
- [ ] Verify all events appear in GA4 Realtime report
- [ ] Test full session flow: create → lobby → start → play → end
- [ ] Test on mobile devices
- [ ] Verify room codes and metrics are captured correctly

### Priority 3: GA4 Dashboard Setup
- [ ] Create custom dimensions for: room_code, instrument, completion_type
- [ ] Set up Session Health report
- [ ] Set up Player Engagement report
- [ ] Set up Survey Conversion report

---

## GA4 Configuration Reference

### Script Setup (already in all templates)

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=__GA4_MEASUREMENT_ID__"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    const GA4_MEASUREMENT_ID = '__GA4_MEASUREMENT_ID__';
    if (GA4_MEASUREMENT_ID && !GA4_MEASUREMENT_ID.startsWith('__')) {
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID, {
            'anonymize_ip': true,
            'allow_google_signals': false,
            'allow_ad_personalization_signals': false
        });
    }

    function trackEvent(eventName, params = {}) {
        if (GA4_MEASUREMENT_ID && !GA4_MEASUREMENT_ID.startsWith('__')) {
            gtag('event', eventName, params);
        }
    }
</script>
```

### Environment Variables

```bash
# .env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

The `build.py` script replaces `__GA4_MEASUREMENT_ID__` placeholder in all templates.

---

## Privacy Configuration

- ✅ IP Anonymization enabled
- ✅ Google Signals disabled (no cross-device tracking)
- ✅ Ad Personalization disabled

**What we track:**
- Session lifecycle events
- Instrument choices
- Technical errors
- Survey engagement

**What we DON'T track:**
- User identities
- Detailed musical patterns
- Personal information

---

## Expected Insights

After collecting data, we should be able to answer:

1. **Lobby Conversion:** What % of rooms that open actually start a jam?
2. **Completion Rate:** Do sessions run to completion or end early?
3. **Player Count:** How many players typically join?
4. **Instrument Popularity:** Which instruments are most/least used?
5. **Survey Engagement:** Are users clicking the feedback survey?
6. **Technical Health:** Are there connection errors we need to address?

---

## V0 Analytics (Archived)

The original V0 analytics plan tracked events for the single `play.html` template with real-time triggers. V1 replaces this with:
- Separate instrument templates
- Lobby system events
- Pattern-based tracking instead of trigger tracking

V0 templates are archived in `archive/` directory.
