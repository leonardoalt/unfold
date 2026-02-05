# Unfold

An infinite zoom-out puzzle game that runs in the browser.

## Concept

1. A puzzle is shown - the player must rearrange pieces to match the reference image
2. When solved, the image zooms out and becomes part of a larger new image
3. The game continues infinitely - each solved puzzle is embedded into the next

## Worlds

Three distinct visual themes:

### Geometry
- Abstract geometric patterns (circles, squares, triangles, stars)
- Level number watermark
- Previous puzzle appears in a white frame within the new image
- Reference image always visible

### Classic
- Dreamlike landscapes and fantasy art (Dixit-style)
- 6 cycling scene types: sunset, forest, ocean, mountains, dreamscape, aurora
- Previous puzzle becomes the background/sky, new scene's foreground is drawn on top with transparency
- Seamless blending - no hard frames

### Space
- Cosmic scenes: nebulae, planets, asteroids, galaxies, space stations, binary stars
- Previous puzzle becomes the background, space elements (planet curves, asteroid fields, nebula wisps) drawn on top
- Seamless blending

## Gameplay

- **Controls**: Drag and drop pieces, or click two pieces to swap them
- **Difficulty**: Starts at 3x3, increases by 1 every 3 levels (no cap)
- **Reference**: Small preview image shown in corner

## Dev Mode

Optional settings accessible from the start screen:
- **Seed**: Set a specific seed for reproducible worlds (blank = random)
- **Start level**: Jump to any level

## Technical

- Pure HTML/CSS/JavaScript - no dependencies
- Images generated procedurally using Canvas API (no AI, no external images)
- Seeded random for reproducibility

## Files

- `index.html` - Structure and mode selection
- `style.css` - Styling and animations
- `game.js` - All game logic and procedural generation
