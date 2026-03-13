# 🌿 Nature – A Living World

A beautiful, fully-animated JavaScript nature scene rendered on an HTML5 Canvas.

## Features

- 🌅 **Day / Night cycle** – smooth sky gradient transitioning through dawn, morning, noon, afternoon, dusk, evening and night
- ☀️ **Sun & Moon** – each follows an arc across the sky with a soft glow halo
- ✨ **Twinkling stars** – appear as darkness falls, fade at sunrise
- ☁️ **Drifting clouds** – multi-puff clouds float gently across the sky
- ⛰️ **Layered mountains** – three depth-stacked ranges with colour gradients
- 🌲 **Swaying trees** – pine trees and deciduous trees sway in the wind
- 🌾 **Waving grass** – hundreds of individual grass blades animated with Bézier curves
- 🦅 **Flying birds** – flocks of birds flap across the scene
- 🐝 **Fireflies** – softly glowing fireflies emerge at night
- 🌊 **Lake** – reflective water surface with animated shimmer, wave lines and ripples
- 🌧 **Rain toggle** – click to enable rainfall with ripple effects on the lake
- 💨 **Wind toggle** – cycles through Calm → Breezy → Windy, affecting clouds, trees, grass and rain

## How to run

Simply open `index.html` in any modern browser, or serve with a local HTTP server:

```bash
npx serve .
# or
python3 -m http.server
```

Then open [http://localhost:8000](http://localhost:8000).

## Controls

| Button | Action |
|--------|--------|
| 🌧 Rain | Toggle rainfall on/off |
| 💨 Wind | Cycle wind level (Calm → Breezy → Windy) |
| 🌙 Night | Force night-time / return to live cycle |

## Structure

```
nature-project/
├── index.html        # Entry point
├── css/
│   └── style.css     # Base styles & UI overlay
└── js/
    └── app.js        # Full canvas animation engine
```
