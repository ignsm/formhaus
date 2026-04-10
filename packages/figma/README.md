# @formhaus/figma

Figma plugin that generates styled form mockups on the canvas from a [Formhaus](https://github.com/ignsm/formhaus) form definition. Maps your design system components to field types via a `componentMap`.

Not published to the Figma Community yet. Install as a local plugin.

## Install (local plugin)

1. Clone the repo: `git clone https://github.com/ignsm/formhaus.git`
2. Build the plugin: `cd formhaus && pnpm install && pnpm --filter @formhaus/figma build`
3. In Figma desktop: **Plugins → Development → Import plugin from manifest...**
4. Pick `packages/figma/manifest.json`

## Usage

1. Open a Figma file
2. **Plugins → Development → Formhaus**
3. Paste a Formhaus form definition JSON into the plugin UI
4. Click **Generate**

The plugin creates a frame per step with all fields rendered as instances of your mapped design system components. Buttons, step counters, and layout are set up automatically.

## Component map

To make the plugin use your own design system instead of the default component keys, go to the **Component Map** tab in the plugin UI and paste a JSON that maps form field types to your Figma component keys and text layer names. The plugin remembers this map across runs.

## Docs

- Full Formhaus guide: https://formhaus.dev
- Plugin guide: https://formhaus.dev/guide/figma.html
- Source and issues: https://github.com/ignsm/formhaus

## License

MIT
