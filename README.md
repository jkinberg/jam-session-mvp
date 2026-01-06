# 🎵 Jam Session

A multiplayer music jam session where players use their phones to build looping patterns and a shared screen displays the visualizer and plays the audio.

> **🤖 For AI Assistants (Claude Code, Cursor, etc.)**: See `CLAUDE.md` for project instructions, `TODO.md` for task tracking, and `ROADMAP.md` for feature prioritization.

---

## Concept

| Component | Description |
|-----------|-------------|
| **Host device** | TV/laptop displays visualizer and plays ALL audio via Tone.js |
| **Phone controllers** | Build 16-step looping patterns (no audio on phones) |
| **Instruments** | Drums, Percussion, Bass, Chords (4 players max) |
| **Sequencer** | 16-step loop at 120 BPM, patterns play in perfect sync |
| **Lobby** | Players join and get ready before session starts |

---

## File Structure

```
jam-mvp/
├── host.template.html      # Host screen template
├── drums.template.html     # Drums phone UI template
├── percussion.template.html # Percussion phone UI template
├── bass.template.html      # Bass phone UI template
├── chords.template.html    # Chords phone UI template
├── build.py                # Build script (generates HTML from templates)
├── vercel.json             # Vercel deployment configuration
├── .env.example            # Example environment variables
├── .env                    # Your environment variables (not committed)
├── *.html                  # Generated files (not committed)
├── archive/                # V0 templates (reference only)
├── v1-planning/            # V1 technical specifications
├── README.md               # This file
├── TODO.md                 # Task tracking
├── ROADMAP.md              # Product roadmap
└── CLAUDE.md               # Instructions for AI assistants
```

---

## Quick Start

### 1. Get an Ably API Key (Free)

1. Go to [ably.com/sign-up](https://ably.com/sign-up)
2. Create a free account
3. Create a new app (call it "Jam Session")
4. Copy the API key from the app dashboard

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Ably API key:
```bash
ABLY_API_KEY=xxxxx.yyyyy:zzzzzzzz
```

### 3. Build the Project

```bash
python3 build.py
```

This generates the HTML files from templates with your API key injected.

### 4. Run Locally

```bash
python3 -m http.server 8000
```

### 5. Open the Host Screen

Go to `http://localhost:8000/host.html`

You'll see the **JAM SESSION** welcome screen. Click **"OPEN ROOM"** to start.

### 6. Connect Players

**Using QR Codes (easiest):**
1. The lobby shows QR codes for each instrument
2. Players scan with their phone camera
3. Each player enters their name and joins

**Note on localhost:** If testing locally, enter your computer's IP address in the yellow warning box to make QR codes work on phones.

### 7. Start the Jam!

Once players have joined, click **"START JAM SESSION"**:
- The 3-minute timer begins
- Players build patterns on their phones
- All sounds play on the host screen in perfect sync
- The visualizer responds to the music

---

## How It Works

### Architecture

```
┌─────────────────────┐
│   HOST (TV/Laptop)  │
│   - 16-step loop    │
│   - Tone.js audio   │
│   - Visualizer      │
└──────────┬──────────┘
           │ Ably (WebSocket)
     ┌─────┴─────┬─────────┬─────────┐
     ▼           ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌───────┐ ┌────────┐
│  Drums  │ │  Perc   │ │ Bass  │ │ Chords │
│ 4×4 grid│ │ 4×4 grid│ │ Piano │ │4 slots │
└─────────┘ └─────────┘ └───────┘ └────────┘
```

- **Phones send patterns** to the host
- **Host plays all sounds** in sync with the 16-step loop
- **No latency issues** — timing is handled entirely by the host
- **Visualizer** responds to audio with pulsing colors and particles

### Instruments

| Instrument | UI | Update Mode |
|------------|-----|-------------|
| **Drums** 🥁 | 4×4 grid (Kick, Snare, HiHat, Clap) | Live — changes sent immediately |
| **Percussion** 🎵 | 4×4 grid (Cowbell, Tambourine, Shaker, Conga) | Live — changes sent immediately |
| **Bass** 🎸 | Piano roll (6 notes × 16 steps) | Draft — tap "Send to Mix" |
| **Chords** 🎹 | 4 slots (Am, F, C, G, Em, Dm) | Draft — tap "Send to Mix" |

### Session Flow

1. **Open Room** — Host generates room code and QR codes
2. **Players Join** — Players scan QR, enter name, wait in lobby
3. **Start Session** — Host clicks "Start Jam Session", timer begins
4. **Jam!** — Players build patterns, host plays audio and shows visualizer
5. **End Session** — Timer runs out or host ends early

---

## Testing Locally

You can test by yourself using multiple browser tabs:

1. Open `host.html` in one tab
2. Click "OPEN ROOM"
3. Open instrument URLs in other tabs:
   - `drums.html?room=XXXX`
   - `percussion.html?room=XXXX`
   - `bass.html?room=XXXX`
   - `chords.html?room=XXXX`

Replace `XXXX` with the room code shown on the host screen.

---

## Deployment

### Vercel (Recommended)

**Live URL:** https://jam-mvp-xi.vercel.app

The app auto-deploys from the `main` branch:

```bash
# Work on feature branch
git checkout feature/v1-sequencer
# Make changes, commit, push
git push origin feature/v1-sequencer

# When ready to deploy, merge to main
git checkout main
git merge feature/v1-sequencer
git push origin main  # Triggers deployment
```

### Security Note

For production, use a restricted Ably API key with only Subscribe and Publish capabilities.

---

## Customization

Edit the template files, then run `python3 build.py`:

### Change Tempo
```javascript
const BPM = 120;  // in host.template.html
```

### Change Session Length
```javascript
const SESSION_DURATION = 180;  // seconds
```

### Add Sounds
Add synths to the host template and buttons to the instrument templates.

---

## Troubleshooting

### "Audio not playing"
- Make sure you clicked "START JAM SESSION" on the host
- Try a different browser (Chrome works best)
- Check browser console for errors

### "Players can't connect"
- Ensure all devices are on the same WiFi
- Enter your computer's IP in the localhost warning box
- Check that the Ably API key is correct

### "QR codes don't work on phone"
- Enter your computer's local IP (192.168.x.x) in the IP override field
- QR codes will regenerate with the correct URL

---

## Credits

- **Tone.js** — Web Audio framework: https://tonejs.github.io/
- **Ably** — Real-time messaging: https://ably.com/
- **QRCode.js** — QR code generation

---

## License

MIT — Do whatever you want with this code!
