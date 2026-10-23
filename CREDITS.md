# Credits

## Images

No third-party photographs or textures are used. Every visual is generated in code:

| File(s)                                               | How it is made                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `public/assets/stills/chapter-N-{640,1280,1920}.webp` | Captured from the procedural 3D bottle with Playwright (`npm run stills`).                 |
| `public/og.png`                                       | The hero still, cropped to 1200x630 and overlaid with text by `scripts/capture-stills.ts`. |
| `public/favicon.svg`                                  | Hand-written SVG.                                                                          |
| Film grain                                            | Inline SVG `feTurbulence` filter in `src/styles.css`.                                      |

Because nothing was downloaded, there are no per-file source URLs or licences to record. If you add
photographic assets later, list each one here with filename, source URL, author, licence name and
licence URL, and only use files whose licence clearly allows free commercial use (for example CC0 from
Poly Haven or ambientCG).

## Fonts (self-hosted through npm, SIL Open Font License 1.1)

- Cormorant Garamond, via `@fontsource/cormorant-garamond`. https://github.com/CatharsisFonts/Cormorant
- Inter, via `@fontsource/inter`. https://github.com/rsms/inter
- Licence: https://openfontlicense.org/open-font-license-official-text/

## Libraries

| Package | Licence                                        | Link                                         |
| ------- | ---------------------------------------------- | -------------------------------------------- |
| three   | MIT                                            | https://github.com/mrdoob/three.js           |
| gsap    | GSAP standard licence (free, incl. commercial) | https://gsap.com/standard-license            |
| lenis   | MIT                                            | https://github.com/darkroomengineering/lenis |

Veyra and Ember & Fig are invented names for a demonstration. Any resemblance to a real brand is
unintentional.
