# 🎵 Jam Session MVP

A minimal multiplayer music jam session where players use their phones as instruments and a shared screen displays the visualizer and plays the audio.

> **🤖 For AI Assistants (Claude Code, Cursor, etc.)**: See `CLAUDE.md` for project instructions, `TECHNICAL_SPEC.md` for detailed architecture, and `ROADMAP.md` for feature prioritization. This README is user-facing setup documentation.

---

## Concept

| Component | Description |
|-----------|-------------|
| **Host device** | TV/laptop displays visualizer and plays ALL audio via Tone.js |
| **Phone controllers** | Send note messages over WebSocket (no audio on phones) |
| **Instruments** | Drums (4 pads), Bass (7 keys with sustain), Chords (6 pads with sustain) |
| **Quantization** | Drums snap to 8th notes; Bass & Chords play immediately for expressive control |
| **Musical constraints** | Bass = C minor pentatonic, Chords = Am-F-C-G-Em-Dm (all in C major/A minor) |

---

## File Structure

```
jam-mvp/
├── host.template.html      # Host screen template (with placeholders)
├── play.template.html      # Phone controller template (with placeholders)
├── build.py                # Build script (generates HTML from templates)
├── vercel.json             # Vercel deployment configuration
├── .env.example            # Example environment variables
├── .env                    # Your environment variables (not committed to git)
├── host.html               # Generated host screen (not committed to git)
├── play.html               # Generated phone controller (not committed to git)
├── index.html              # Generated index (same as host, not committed)
├── README.md               # This file (user setup guide)
├── TODO.md                 # Project TODO list and task tracking
├── ROADMAP.md              # Product roadmap and feature prioritization
├── CLAUDE.md               # Instructions for AI assistants
├── TECHNICAL_SPEC.md       # Detailed technical documentation
├── ANALYTICS_PLAN.md       # Google Analytics integration plan
├── GROOVE_FEEDBACK_PLAN.md # Groove meter & feedback system technical plan
├── WEBRTC_ARCHITECTURE.md  # WebRTC migration architecture (future)
└── SURVEY_QUESTIONS.md     # User feedback survey questions
```

---

## Quick Start

### 1. Get an Ably API Key (Free)

1. Go to [ably.com/sign-up](https://ably.com/sign-up)
2. Create a free account
3. Create a new app (call it "Jam Session" or whatever you like)
4. Copy the API key from the app dashboard (looks like: `xxxxx.yyyyy:zzzzzzzz`)

### 2. Set Up Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Ably API key:

```bash
ABLY_API_KEY=xxxxx.yyyyy:zzzzzzzz
```

### 3. Build the Project

Run the build script to generate the HTML files:

```bash
python3 build.py
```

This will create `host.html`, `play.html`, and `index.html` from the templates with your API key injected.

### 4. Run Locally

You need a local web server because browsers restrict some features on `file://` URLs.

**Option A: Python (easiest)**
```bash
# Python 3
python3 -m http.server 8000

# Or if 'python' points to Python 3 on your system
python -m http.server 8000
```

**Option B: Node.js**
```bash
npx serve .
```

**Option C: VS Code**
Install the "Live Server" extension and click "Go Live"

### 5. Open the Host Screen

On your laptop/TV, go to either:
```
http://localhost:8000/
```
or
```
http://localhost:8000/host.html
```

Both URLs load the host screen. You'll see:
- A 4-digit room code
- **QR codes** for each instrument (Drums, Bass, Chords)
- Join URLs for manual entry

**Note on localhost**: If you see an orange warning about using localhost, enter your computer's IP address in the input box and click "Update" to make the QR codes work on phones.

### 6. Connect Players

**Easiest way: Scan QR Code**
1. Open your phone's camera app
2. Point it at one of the QR codes on the host screen
3. Tap the notification to join

**Alternative: Manual URL entry**

On each phone, go to one of the URLs shown on the host screen:
```
http://[your-computer-ip]:8000/play.html?room=XXXX&instrument=drums
http://[your-computer-ip]:8000/play.html?room=XXXX&instrument=bass
http://[your-computer-ip]:8000/play.html?room=XXXX&instrument=chords
```

**To find your computer's IP:**
- **Mac**: `ipconfig getifaddr en0` in Terminal, or System Settings → Network → Wi-Fi
- **Windows**: `ipconfig` in Command Prompt (look for IPv4 Address)
- **Linux**: `hostname -I` or `ip addr`

Look for an address like `192.168.x.x` or `10.0.x.x` (NOT `127.0.0.1`)

### 7. Jam!

Once players are connected, click **"START HOST"** on the host screen:
- The 3-minute timer begins
- Players tap their instrument controls
- All sounds play on the shared screen (not on phones)
- Sounds are automatically quantized to the beat
- Visual metronome shows the 4-beat pattern in sync

**To end early**: Click the red **"End Session"** button next to the timer

---

## How It Works

### Architecture

```
┌─────────────────────┐
│   HOST (TV/Laptop)  │
│   - Tone.js audio   │
│   - Visualizer      │
│   - Beat sync       │
└──────────┬──────────┘
           │ Ably (WebSocket)
     ┌─────┴─────┬─────────────┐
     ▼           ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Phone 1 │ │ Phone 2 │ │ Phone 3 │
│ (Drums) │ │ (Bass)  │ │(Chords) │
└─────────┘ └─────────┘ └─────────┘
```

- **Phones send control messages** (e.g., `{type: 'drums', note: 'kick', velocity: 0.8}`)
- **Host receives messages and plays sounds** via Tone.js
- **Drums are quantized** to 8th notes; bass & chords play immediately for expressive control
- **Beat indicators** use time-based sync (improved but may drift slightly due to network latency)
- **Stereo mixing** - Drums panned across stereo field for spatial separation
- **Frequency separation** - Chords raised one octave to avoid clashing with bass

### Instruments

| Instrument | Controls | Sound | Mix Position |
|------------|----------|-------|--------------|
| **Drums** 🥁 | 4 pads: Kick, Snare, Hi-Hat, Clap | Synthesized drums with velocity sensitivity (MembraneSynth, NoiseSynth, MetalSynth) | Kick: Center, Snare: Left, Hat: Right, Clap: Left |
| **Bass** 🎸 | 7 keys: C, D, E, F, G, A, B | MonoSynth with filter and hold-to-sustain (notes mapped to C minor pentatonic, octave 2) | Center (foundation) |
| **Chords** 🎹 | 6 pads: Am, F, C, G, Em, Dm | PolySynth playing 3-note chords with hold-to-sustain (octaves 3-4) | Slight right |

### Musical Constraints

To make everything "sound good without trying":
- **Drums** are **quantized to 8th notes** with velocity sensitivity for expressive rhythm
- **Bass & Chords** play **immediately** (no quantization) for expressive, natural feel
- Bass notes are **mapped to C minor pentatonic** (no wrong notes)
- Chords are **6 diatonic options** in C major/A minor (Am, F, C, G, Em, Dm) - all work together
- Fixed tempo of **120 BPM**
- **Hold-to-sustain** on bass and chords for melodic/harmonic control

---

## Testing Locally (Solo)

You can test the full experience by yourself:

1. Open `host.html` in one browser tab
2. Open `play.html?room=XXXX&instrument=drums` in another tab
3. Open `play.html?room=XXXX&instrument=bass` in another tab
4. Open `play.html?room=XXXX&instrument=chords` in another tab

Replace `XXXX` with the room code shown on the host screen.

---

## Deploying for Real Testing

### Option A: Vercel (Recommended - Automatic Deployments)

**Live URL:** https://jam-mvp-xi.vercel.app

The app is deployed on Vercel with automatic deployments enabled:
- **Every push to `main` branch** triggers a new production deployment
- **Pull requests** get preview deployments automatically
- **Free tier** includes HTTPS, custom domains, and 100GB bandwidth/month

**First-time setup:**
```bash
# Install Vercel CLI (optional - only needed for manual deploys)
npm install -g vercel

# Deploy manually (if not using auto-deploy from GitHub)
npx vercel --prod
```

**Recommended Git Workflow:**

Since Vercel auto-deploys from `main`, use feature branches to avoid accidental deploys:

```bash
# Create a feature branch for your work
git checkout -b feature/my-new-feature

# Make changes, commit, and push to feature branch
git add .
git commit -m "Add new feature"
git push origin feature/my-new-feature

# When ready to deploy, merge to main
git checkout main
git merge feature/my-new-feature
git push origin main  # This triggers a Vercel deployment
```

**To disable auto-deploy from main:**
- Go to Vercel dashboard → Project Settings → Git
- Configure which branches trigger deployments

**Security Best Practice:**

For production deployment on Vercel, use a **restricted Ably API key**:
1. In Ably dashboard → API Keys → Create New Key
2. Enable only: `Subscribe` and `Publish` capabilities (disable admin, history, stats, etc.)
3. Add this restricted key to Vercel environment variables
4. Keep your root key for local development only

This limits potential damage if someone extracts the API key from client-side code.

### Option B: ngrok (Quick & Free for Testing)

1. Install ngrok: https://ngrok.com/download
2. Run your local server: `python -m http.server 8000`
3. In another terminal: `ngrok http 8000`
4. Share the ngrok URL (e.g., `https://abc123.ngrok.io/host.html`)

---

## Customization Ideas

### Change the Tempo
In `host.template.html`, find:
```javascript
const BPM = 120;
```
Then run `python3 build.py` to regenerate files.

### Change Session Length
In `host.template.html`, find:
```javascript
const SESSION_DURATION = 180; // 3 minutes in seconds
```
Then run `python3 build.py` to regenerate files.

### Add More Drum Sounds
In `host.template.html`, add to `drumSynths` object and update `playDrum()` function, then rebuild.

### Change the Scale
In `host.template.html`, modify the `bassNotes` object to use different notes, then rebuild.

### Change Chord Progression
In `host.template.html`, modify the `chordNotes` object, then rebuild.

**Note:** Always edit the `.template.html` files, not the generated `.html` files, then run `python3 build.py`.

---

## Troubleshooting

### "Audio not playing"
- Make sure you clicked "START HOST" on the host screen
- Check browser console for errors
- Try a different browser (Chrome works best)

### "Players can't connect" or "QR codes don't work"
- Make sure both devices are on the same WiFi network
- If using `localhost`, enter your computer's IP in the orange warning box on the host screen
- Check that you're using your computer's local IP, not `localhost`
- Verify the Ably API key is correct and properly injected by the build script

### "High latency / delay"
- This MVP uses a cloud service (Ably) which adds some latency
- For lower latency, consider WebRTC (see Phone Party framework)
- The quantization helps mask small delays

### "Beat indicators not in sync between host and phones"
- Beat indicators use time-based synchronization but may drift due to network latency
- Current implementation has known sync issues that need improvement
- Try refreshing phone browsers if drift is severe
- For production use, a lower-latency solution (e.g., WebRTC) would be needed

---

## User Feedback

The app includes an integrated feedback survey that appears automatically at the end of each session:
- **Host screen:** QR code and link button on end overlay
- **Player screens:** "Share Feedback" button on end overlay
- **Survey URL:** https://forms.gle/3KSkcUiae2DvfePr9

The survey collects feedback on:
- Core experience (fun factor, would you play with friends)
- Technical performance (timing, responsiveness)
- Instrument feel and improvements needed
- Overall product validation

---

## Next Steps

See **ROADMAP.md** for comprehensive feature prioritization and implementation planning.

**Current Phase:** Feedback collection (waiting for 10-20 survey responses)

**Recently completed:**
- ✅ **Analytics Integration** - Google Analytics 4 for product validation metrics (see ANALYTICS_PLAN.md)

**Planned improvements:**
1. **Groove Meter & Feedback System** - Make it feel more game-like with goals and progression (see GROOVE_FEEDBACK_PLAN.md)
2. **Lower latency** - Migrate to WebRTC for <50ms latency (see WEBRTC_ARCHITECTURE.md)
3. **More instruments** - Melody sequencer, additional percussion, FX controller
4. **Visual polish** - Better visualizer, player avatars, social sharing image
5. **Session recording** - Save and share jam sessions

---

## Credits

- **Tone.js** - Web Audio framework: https://tonejs.github.io/
- **Ably** - Real-time messaging: https://ably.com/

---

## License

MIT - Do whatever you want with this code!
