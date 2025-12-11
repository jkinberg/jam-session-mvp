# 🎵 Jam Session MVP

A minimal multiplayer music jam session where players use their phones as instruments and a shared screen displays the visualizer and plays the audio.

> **🤖 For AI Assistants (Claude Code, Cursor, etc.)**: See `TECHNICAL_SPEC.md` for detailed architecture, code structure, message protocols, and extension points. This README is user-facing setup documentation.

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
├── host.template.html  # Host screen template (with placeholders)
├── play.template.html  # Phone controller template (with placeholders)
├── build.py            # Build script (generates HTML from templates)
├── .env.example        # Example environment variables
├── .env                # Your environment variables (not committed to git)
├── host.html           # Generated host screen (not committed to git)
├── play.html           # Generated phone controller (not committed to git)
├── README.md           # This file (user setup guide)
├── TODO.md             # Project TODO list and feature roadmap
├── CLAUDE.md           # Instructions for AI assistants
└── TECHNICAL_SPEC.md   # Detailed technical documentation for developers/AI
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

This will create `host.html` and `play.html` from the templates with your API key injected.

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

On your laptop/TV, go to:
```
http://localhost:8000/host.html
```

You'll see:
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

### Files

```
jam-mvp/
├── host.html    # Shared screen (run on TV/laptop)
├── play.html    # Phone controller (adapts to instrument)
└── README.md    # This file
```

### Instruments

| Instrument | Controls | Sound |
|------------|----------|-------|
| **Drums** 🥁 | 4 pads: Kick, Snare, Hi-Hat, Clap | Synthesized drums with velocity sensitivity (MembraneSynth, NoiseSynth, MetalSynth) |
| **Bass** 🎸 | 7 keys: C, D, E, F, G, A, B | MonoSynth with filter and hold-to-sustain (notes mapped to C minor pentatonic) |
| **Chords** 🎹 | 6 pads: Am, F, C, G, Em, Dm | PolySynth playing 3-note chords with hold-to-sustain |

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

### Option A: ngrok (Quick & Free)

1. Install ngrok: https://ngrok.com/download
2. Run your local server: `python -m http.server 8000`
3. In another terminal: `ngrok http 8000`
4. Share the ngrok URL (e.g., `https://abc123.ngrok.io/host.html`)

### Option B: Vercel/Netlify (Permanent)

1. Create a GitHub repo with these files
2. Connect to Vercel or Netlify
3. Deploy (it's free for static sites)
4. Share the URL with friends

---

## Customization Ideas

### Change the Tempo
In `host.html`, find:
```javascript
const BPM = 120;
```

### Change Session Length
In `host.html`, find:
```javascript
const SESSION_DURATION = 180; // 3 minutes in seconds
```

### Add More Drum Sounds
In `host.html`, add to `drumSynths` object and update `playDrum()` function.

### Change the Scale
In `host.html`, modify the `bassNotes` object to use different notes.

### Change Chord Progression
In `host.html`, modify the `chordNotes` object.

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
- Verify the Ably API key is correct in both files

### "Only beats 1 and 3 are lighting up"
- This was a bug that has been fixed - update to the latest version of the code

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

## Next Steps

If this MVP validates the concept, consider adding:

1. **Visual polish** - Better visualizer, player avatars
2. **More instruments** - Melody sequencer, turntable, FX controller
3. **Session recording** - Save and share jams
4. **Themes/sample packs** - Different musical styles
5. **Lower latency** - Migrate to WebRTC (Phone Party framework)

---

## Credits

- **Tone.js** - Web Audio framework: https://tonejs.github.io/
- **Ably** - Real-time messaging: https://ably.com/

---

## License

MIT - Do whatever you want with this code!
