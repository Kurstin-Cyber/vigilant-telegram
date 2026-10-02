# The Blackwood Files

A cinematic, episodic murder mystery that runs in the browser. There's nothing to install and no build step.

- **Three episodes**, each ending on a cliffhanger about the suspects.
- **Scene-based storytelling**: animated backdrops, character portraits, and typewriter dialogue.
- **Audio**: a synthesized score with reverb, room ambience (wind, fire, clocks), sound effects, and **spoken dialogue** with a different voice for each character and the narrator.
- **The story plays itself** (Auto mode). Tap or press Space to move faster.
- **Your choices and your evidence matter.** You question people, present clues to catch lies, and name the killer in the finale.
- Progress is saved in the browser.

## Play

Open `index.html`, or enable GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).

Best with headphones and the sound up. Browsers only allow sound after a first tap or key press, so the music starts when you first touch the title screen.

Spoken dialogue uses your browser's built-in speech voices, so how it sounds depends on your device (Chrome, Edge and Safari have the best voices). If your browser has no usable voices, the game falls back to text and music. You can switch voices on and off in the Menu or on the title screen.

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
- `js/voice.js`: spoken dialogue
