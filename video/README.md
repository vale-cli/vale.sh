# Vale promo video

A forty-second walk through the landing page, built with
[Remotion](https://www.remotion.dev): the guideline, the rule, a run, what Vale
sees in a document, the speed figures, and the install command.

```bash
cd video
npm install
npm run studio   # preview and scrub in the browser
npm run render   # writes out/vale-promo.mp4
```

Everything is in `src/Promo.tsx`. The examples and figures are the landing
page's own, so when one changes there, change it here and render again.

Remotion is free for individuals and small teams and needs a company license
above that; see <https://www.remotion.dev/docs/license>.
