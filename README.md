# Progress bar image generator

Node.js tool that renders **PNG** progress bars from a **JSON** configuration. It builds an SVG internally and rasterizes it with [Sharp](https://sharp.pixelplumbing.com/) (libvips), with optional palette-based compression for small files.

## Requirements

- **Node.js** 18 or newer  
- **npm** (or another compatible package manager)

## Install

```bash
git clone <repository-url>
cd progress-bar-generator
npm install
```

## Quick start

1. Copy or edit a JSON config (see `example.config.json`).
2. Run the CLI:

```bash
node src/cli.js --config example.config.json
```

Or:

```bash
npm run example
```

Images are written under `outputDir` (see below). The CLI prints how many files were generated and the output folder path.

## CLI

```text
node src/cli.js --config <path/to/config.json>
node src/cli.js -c <path/to/config.json>
```

- If `--config` is omitted, the script exits with an error.
- `outputDir` in the JSON may be **absolute** or **relative**. Relative paths are resolved from the **directory that contains the config file**, not from the current working directory.

## Configuration

All options are optional except what you need for your chosen **generation mode** (see below). Unspecified keys use the built-in defaults from `src/defaults.js`.

### Canvas and bar

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | number | `400` | PNG width in pixels. |
| `height` | number | `64` | PNG height in pixels. |
| `percentage` | number | `0` | Fill level **0–100** (single-image mode). |
| `backgroundColor` | string | `#FFFFFF` | Track / empty area color (hex). |
| `barColor` | string | `#0000FF` | Fill color when no `thresholds` match. |
| `borderWidth` | number | `2` | Stroke width around the inner widget. |
| `borderColor` | string | `#333333` | Border stroke color. |
| `borderRadius` | number | `8` | Corner radius of the outer bordered rectangle. |
| `padding` | number | `4` | Space between the border and the track. |
| `margin` | number or object | `8` | Outer inset from the PNG edge. May be a number (all sides) or `{ top, right, bottom, left }`. |
| `barBorderRadius` | number or `null` | `null` | Corner radius of the **filled** bar. `null` follows the inner track radius. `0` yields a square leading edge (still clipped by the track). |

### Color by percentage (`thresholds`)

Array of `{ until, barColor }`, sorted by `until` ascending.

- For value `p`, the first item with **`p < until`** wins.
- Values **≥** the last `until` use the **last** item’s `barColor`.

Example (red / yellow / green):

- `[0, 20)` → first color  
- `[20, 60)` → second  
- `[60, 100]` → third  

Default thresholds in code: red / yellow / green style bands.

### Label (optional)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showLabel` | boolean | `false` | Draw `NN%` centered on the track. |
| `labelColor` | string | `#1a1a1a` | Text color. |
| `labelFontSize` | number or `null` | `null` | Font size in px; if `null`, derived from track height. |

Equivalent nested object (merged into the same fields):

```json
"label": {
  "enabled": true,
  "color": "#111111",
  "fontSize": 18
}
```

`show` is accepted as an alias for `enabled`.

### Bar shorthand

```json
"bar": { "borderRadius": 8 }
```

Same as `"barBorderRadius": 8`.

### PNG output (`png`)

Merged with internal defaults for smaller files. Common overrides:

| Property | Default (in code) | Notes |
|----------|-------------------|--------|
| `compressionLevel` | `9` | Max zlib (0–9). |
| `adaptiveFiltering` | `true` | Row filter hint. |
| `effort` | `10` | More work for palette path (1–10). |
| `palette` | `true` | Often much smaller; disable if labels show banding. |
| `quality` | `100` | Palette quality (when `palette` is true). |
| `colors` / `colours` | `256` | Max palette entries. |
| `dither` | `1` | Error diffusion when using palette. |

Any other [Sharp `png` options](https://sharp.pixelplumbing.com/api-output#png) can be passed through the same object.

### Output

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `outputDir` | string | `./output` | Output directory (absolute or relative to the config file). |
| `filename` | string | — | Used in **single-image** mode if no `series` / `images`. Default name: `progress-<percentage>.png`. |

## Generation modes

Exactly **one** of these applies, in this order of precedence:

### 1. `images` array

Explicit list of outputs. Each entry is merged over the root config (except `images` / `series` are stripped from children).

```json
{
  "width": 400,
  "height": 64,
  "outputDir": "./out",
  "images": [
    { "percentage": 0, "filename": "empty.png" },
    { "percentage": 50, "filename": "half.png", "showLabel": true }
  ]
}
```

### 2. `series` object

Sweep `percentage` from `from` to `to` inclusive, stepping by `step`.

```json
"series": {
  "from": 0,
  "to": 100,
  "step": 1,
  "filenamePattern": "bar-{percent}.png"
}
```

`{percent}` in `filenamePattern` is replaced by the numeric percentage for that frame.

### 3. Single image

No `images` and no `series`: one PNG using root `percentage` and optional `filename`.

## npm scripts

| Script | Command |
|--------|---------|
| `npm run generate -- --config <file.json>` | Runs the CLI; everything after `--` is passed to `node src/cli.js`. |
| `npm run example` | Same as `node src/cli.js --config example.config.json`. |

## Programmatic use

```javascript
import { mergeConfig } from './src/mergeConfig.js';
import { renderProgressPng, writeProgressPng } from './src/generate.js';

const config = mergeConfig({
  percentage: 42,
  width: 320,
  height: 48,
  showLabel: true,
});

const buffer = await renderProgressPng(config);
await writeProgressPng(config, './out/progress.png');
```

`mergeConfig()` applies defaults, margin normalization, and nested `label` / `bar` flattening.

## How it works

1. JSON is parsed and merged with defaults (`src/mergeConfig.js`).
2. Fill color is chosen from `thresholds` (or `barColor`).
3. `src/svg.js` emits SVG (track, border, fill, optional label).
4. Sharp converts SVG → PNG using `getPngOptions()` (`src/pngOptions.js`).

## License

Add your license here if the project is published.
