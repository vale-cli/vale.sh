# Vale promo video

The landing page's videos, built with [Remotion](https://www.remotion.dev).

- **`ValePromo`** is the film, a little over a minute: each scene is a claim
  alone on the screen, then the shot that proves it.
- **`ExtensionPromo`** is the browser extension's store video, about 40
  seconds, in `src/Extension.tsx`. It reuses the film's pieces, and its
  comment and messages are the store screenshots' (vale-web
  `scripts/screenshots/shoot.mjs`).
- **`LoopRule`, `LoopRun`, `LoopFix`, `LoopDocument`** are single shots at
  1280x720 with no claim, for a section of the page to play on a loop.

```bash
cd video
npm install
npm run studio   # preview and scrub in the browser
npm run render   # writes out/vale-promo.mp4
npx remotion render src/index.ts LoopFix out/LoopFix.mp4
npx remotion render src/index.ts ExtensionPromo out/vale-extension.mp4
```

The film and loops are in `src/Promo.tsx`. The examples and figures are the landing
page's own, so when one changes there, change it here and render again. The
page plays compressed copies from `static/media` (`vale-promo.*` and
`loops/*`), made from the renders with ffmpeg; its chapter list in
`src/lib/components/landing/Promo.svelte` names where each scene starts.

Remotion is free for individuals and small teams and needs a company license
above that; see <https://www.remotion.dev/docs/license>.
