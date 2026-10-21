# YalumyHub visual asset catalogue

All paths are relative to the repository root. This visual refresh uses locally hosted assets only; no external image URLs are required.

## Photography / WebP
- `assets/images/hero/study-desk-photo.webp` — home hero study desk.
- `assets/images/courses/biology-books-photo.webp` — courses and biology section cards.
- `assets/images/lessons/homme-photo.webp` — male reproduction lesson-related artwork.
- `assets/images/podcast/podcast-studio-photo.webp` — podcast section.
- `assets/images/tools/focus-room-photo.webp` — focus timer / focused study.
- `assets/images/tools/relax-session-photo.webp` — breathing and relaxation.
- `assets/images/tools/memory-map-photo.webp` — memory map.
- `assets/images/tools/educational-games-photo.webp` — educational games.
- `assets/images/mini-pod-success.png` — existing Mini Pod series cover.

## Brand and patterns
- `assets/images/brand/logo-light.svg` and `logo-dark.svg` — full wordmark for light and dark themes.
- `assets/images/brand/mark.svg` and `mark-dark.svg` — symbol / browser mark for light and dark themes.
- `assets/images/brand/our-story.svg` — brand story illustration.
- `assets/patterns/yalumy-light.svg` and `yalumy-dark.svg` — seamless repeating blossom/book/monogram patterns.

## Educational and supportive SVG art
- `assets/images/hero/study-hero.svg` and `study-workspace.svg` — vector alternatives for study hero placement.
- `assets/images/courses/biology-lab.svg` and `course-library.svg` — biology / course visuals.
- `assets/images/lessons/biology.svg`, `femme.svg`, and `homme.svg` — scientific/lesson illustrations. The female reproduction lesson intentionally uses a diagram-style asset rather than a misleading lifestyle photo.
- `assets/images/podcast/podcast-studio.svg` — podcast illustration.
- `assets/images/tools/focus-room.svg`, `focus-timer.svg`, `breathe-room.svg`, `relax-breathing.svg`, `memory-map.svg`, and `educational-games.svg` — vector variants for tool/feature sections.
- `assets/images/story/yalumy-story.svg` — story illustration.

## Standalone SVG icons
All icons live in `assets/icons/`, use currentColor where appropriate, and can be sized/tinted via CSS:
`home.svg`, `courses.svg`, `lessons.svg`, `biology.svg`, `podcast.svg`, `focus.svg`, `relax.svg`, `breathe.svg`, `memory.svg`, `flashcards.svg`, `quiz.svg`, `games.svg`, `search.svg`, `profile.svg`, `user.svg`, `language.svg`, `light.svg`, `dark.svg`, `sun.svg`, `moon.svg`, `play.svg`, `pause.svg`, `stop.svg`, `pdf.svg`, `open.svg`, `progress.svg`, `settings.svg`, and `shop.svg`.

## Theme and accessibility notes
- The shared stylesheet switches pattern, surfaces, text and controls with `body.dark`.
- Decorative section art may use empty alt text; the script assigns descriptive alt text to inserted educational/section images.
- Shop remains out of the normal navigation and is marked `noindex,nofollow`; the shop files themselves are retained for future product launch.
- Before merging, verify every changed HTML page in a browser at desktop and mobile widths, and manually test theme switching and all educational links/PDFs.
