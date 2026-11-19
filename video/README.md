# Vale promo video

The landing page's videos, built with [Remotion](https://www.remotion.dev).

- **`ValePromo`** is the film, a little over a minute: each scene is a claim
  alone on the screen, then the shot that proves it.
- **`LoopRule`, `LoopRun`, `LoopFix`, `LoopDocument`** are single shots at
  1280x720 with no claim, for a section of the page to play on a loop.

```bash
cd video
npm install
npm run studio   # preview and scrub in the browser
npm run render   # writes out/vale-promo.mp4
npx remotion render src/index.ts LoopFix out/LoopFix.mp4
```

Everything is in `src/Promo.tsx`. The examples and figures are the landing
page's own, so when one changes there, change it here and render again. The
page plays compressed copies from `static/media` (`vale-promo.*` and
`loops/*`), made from the renders with ffmpeg; its chapter list in
`src/lib/components/landing/Promo.svelte` names where each scene starts.

Remotion is free for individuals and small teams and needs a company license
above that; see <https://www.remotion.dev/docs/license>.
