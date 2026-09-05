# TEXT6B-FONT1 — Extended Font Library

Purpose: bring Card Designer typography closer to Illustrator/Photoshop-style font browsing without bundling proprietary font files.

Implemented:
- Expanded curated font library grouped into Adobe/Creative Suite, Modern Sans, Serif/Editorial, Display/Poster, Condensed, Script/Handwritten, Monospace, and UI/System groups.
- 75 listed entries / 74 unique family names, including Myriad Pro, Minion Pro, Acumin Pro, Source Sans 3, Source Serif 4, Source Code Pro, Adobe Garamond Pro, Trajan Pro 3, Inter, Roboto, Montserrat, Poppins, Playfair Display, Bebas Neue, JetBrains Mono, and others.
- Custom / Installed Font text field so any locally installed font family name can be used without hard-coding it into the app.
- Named weight/style choices: Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, Black (100–900).
- Same expanded family browser used for Rich Text Selection and Shape/PATH text labels.
- Existing template font family strings remain valid; custom fonts are preserved and shown as Current / Custom.

Important behavior:
- Font files are NOT bundled. Rendering uses fonts available to the operating system/Electron environment. Missing fonts fall back to an available system font.
- Exact availability and licensed use remain the responsibility of the installed font source (system font, Adobe Fonts activation, or another licensed font provider).

Targeted verification:
- CardDesigner.tsx TypeScript/TSX transpile PASS.
- Curated font coverage wiring PASS.
- Normal Text, Rich Text Selection, Shape/PATH label font browser wiring PASS.
- 75 font entries / 74 unique family names detected in the source.

Full monorepo typecheck/test/build was not claimed for this enhancement.
