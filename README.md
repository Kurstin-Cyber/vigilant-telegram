# The Blackwood Files

A cinematic murder mystery for a whole room. Put it on the big screen, everyone joins from their own phone, and the group votes on who they think did it. No apps to install.

December, 1926. A blizzard seals Blackwood Manor. Four episodes, each ending on a cliffhanger. Someone is lying. Perhaps more than one.

## Group night (the main way to play)

1. Open **`/tv`** on the big screen (a TV, a projector, or a laptop on HDMI). It shows the story preview, a **QR code** and a 4-letter room code.
2. Everyone scans the code with their phone camera (or opens the address and types the code), then enters a name.
3. The **first person to join is the host** and starts the story from their phone. They can also pause, skip a line, turn auto-play on or off, close a vote early and remove players, and they can hand hosting to someone else. The host gets no extra votes.
4. The story plays itself on the big screen, with voices and music. When the story needs a decision, every phone shows the same options and the **most popular choice wins**. At the end of every episode, and again before the finale, everyone votes secretly on who they think the killers are. The group's verdict decides whom the Inspector accuses.
5. A **scoreboard** at the end shows who followed the clues best.

Phones that lock or reload rejoin by themselves. If the TV is reloaded the room is still there.

### Run it

Needs Node 20 or newer and has no dependencies.

```sh
npm start        # http://localhost:3000
npm test
```

On a laptop with no internet (a shelter, a community hall), start a hotspot or use the venue's Wi-Fi, run `npm start`, open `http://<laptop's address>:3000/tv` on the screen, and phones open the address shown under the QR code. Everything, including the voices and music, is served from the laptop.

### Deploy

`render.yaml` defines the Render web service (Starter plan, always on) and a free Key Value store for saved rooms: **New > Blueprint** and pick this repo. Any host that runs `node server/server.js` and supports long-lived HTTP responses works. It listens on `PORT`. Open `/health` to see which version is live.

Rooms are saved to Render's free **Key Value** store, so a redeploy or crash does not end the night. Without `REDIS_URL` (for example when running locally) rooms live in memory only.

## Playing alone or on one screen

Open `index.html` (or the GitHub Pages link). Choose 1 to 6 detectives and pass the device around to vote. This mode needs no server.

## Audio

Every line is voiced by a recording from a neural voice model, with a different voice for each character, over an orchestral score and sound effects. The music dips while someone is speaking. Best with the sound up. Browsers only allow sound after a first tap, so tap the screen once.

## Layout

- `server/server.js`: rooms, QR join, live updates (Server-Sent Events). `server/store.js`: optional Redis saving.
- `index.html`, `js/`: the story engine and the TV screen (`/tv`). `js/story.js` holds all story content (spoilers inside).
- `join.html`, `js/controller.js`, `join.css`: the phone.
- `audio/voice/`: one MP3 per line (named by a hash of speaker + text). `audio/music/`: the score.
- `tools/`: scripts that generate the voices and the score.

## Regenerating the audio

If you edit story text, regenerate the voices (unchanged lines are skipped), then remove recordings nothing uses:

```
node tools/extract_lines.js > lines.json
python3 tools/generate_voices.py lines.json audio/voice     # setup is in the script's header
node tools/prune_voices.js
```

To re-render the score: `python3 tools/compose_score.py audio/music` (needs `fluidsynth` and the FluidR3 GM soundfont).

## Credits

- Voices: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), run with sherpa-onnx.
- Score: original compositions rendered with the FluidR3 GM soundfont.
- QR codes: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT), in `js/vendor/`.
