# The Blackwood Files

A cinematic, episodic murder mystery that runs in the browser. There's nothing to install and no build step.

- **Three episodes**, each ending on a cliffhanger about the suspects.
- **Scene-based storytelling**: animated backdrops, character portraits, and typewriter dialogue.
- **Audio**: fully voiced. Every line of dialogue and narration is a recording from a neural voice model, with a different voice for each character. The score is orchestral (piano, strings, cello, choir, timpani) and shifts with the mood of each scene, with room ambience and sound effects layered on top.
- **The story plays itself** (Auto mode). Tap or press Space to move faster.
- **Your choices and your evidence matter.** You question people, present clues to catch lies, and name the killer in the finale.
- Progress is saved in the browser.

## Play

Open `index.html`, or enable GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).

Best with headphones and the sound up. Browsers only allow sound after a first tap or key press, so the music starts when you first touch the title screen.

The music dips automatically while someone is speaking. You can turn spoken dialogue off in the Menu or on the title screen.

## Controls

| Action | Input |
| --- | --- |
| Advance / skip text | Tap, Space, Enter |
| Pick a choice | Tap, or keys 1 to 9 |
| Menu | Esc |

## Layout

- `js/story.js`: all story content (spoilers inside)
- `js/engine.js`: scene runner
- `js/art.js`: procedural backgrounds and portraits
- `js/audio.js`: synthesized music and effects
- `js/voice.js`: plays the voice recordings
- `audio/voice/`: one MP3 per line of dialogue (named by a hash of speaker + text)
- `audio/music/`: the score
- `tools/`: scripts that generate the voices and the score (see below)

## Regenerating the audio

If you edit story text, regenerate the voices (unchanged lines are skipped):

```
node tools/extract_lines.js > lines.json
python3 tools/generate_voices.py lines.json audio/voice     # see the header of the script for setup
```

To re-render the score: `python3 tools/compose_score.py audio/music` (needs `fluidsynth` and the FluidR3 GM soundfont).

## Audio credits

- Voices: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), run with sherpa-onnx.
- Score: original compositions rendered with the FluidR3 GM soundfont.
