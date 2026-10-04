# Profile appearance

The photo backdrop follows `SgfDevs/scss/pages/profile.scss` from frontend reference commit `93d55c91102b75174a3b078e707767d602f8a5db`. The legacy `$dark_blue` is `#153557` in `scss/base/_variables.scss`. Its pseudo-element remains document-positioned at top 125px, right 0, with the existing 200px/340px height and 300px/440px/30% width breakpoints. Route-local isolation keeps its negative z-index above the white body and below the header artwork without changing the containing block or shared shell.

`SgfDevs/Views/Member/MemberProfile.cshtml` uses Font Awesome 5.14.0 Brands for Twitter, LinkedIn, Facebook, Instagram and Youtube, and the solid globe for the website. The bundled Pro fonts carry a commercial-license notice and were not copied. The six inline social paths come from the same-version Font Awesome Free SVGs, with their original viewBoxes and proportional widths. Metadata icons remain unchanged.

Artwork source: https://github.com/FortAwesome/Font-Awesome/tree/5.14.0/svgs, `brands/{twitter,linkedin,facebook,instagram,youtube}.svg` and `solid/globe.svg`. Font Awesome Free 5.14.0 by @fontawesome, https://fontawesome.com. SVG icons are licensed under CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Original artwork is unchanged, embedded locally as inline paths rather than standalone SVG files. The upstream notice is retained at `/licenses/font-awesome-free.txt`. Brand marks belong to their respective owners.

These changes cover only the photo backdrop and social glyph display. Synthetic screenshots establish neither production photo parity nor exact whole-page parity.
