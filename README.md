# Song Library

A static site that shows a card for each song in `songs.tsv`. Clicking a card opens that song's own page with Key, Tempo, Meter, Genre, a link to its Hooktheory TheoryTab, and sections for structure, chord changes and sheet music.

## Publish on GitHub Pages

1. Create a new repository on GitHub and upload all of these files (keep the `sheet-music` folder).
2. In the repo go to **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, then save.
3. After a minute the site is live at `https://teferensen.github.io/tch-2026-nye/`.

## Editing songs

All of the data lives in **`songs.tsv`**, which you can edit in Excel, Google Sheets or a text editor. Keep it tab-separated with this header row:

| Column | What goes in it |
|---|---|
| Artist, Song | Shown on the card and page |
| Key, Tempo, Meter, Genre | Tempo is a number (BPM). Separate several genres with commas |
| Hooktheory | Full URL of the TheoryTab page |
| Structure | Sections in order, separated by `;` → `Intro; Verse; Chorus; Verse; Chorus; Bridge; Chorus` |
| Chords | One line per section, separated by `;`, as `Section: chords` → `Verse: E♭ B♭ Cm A♭; Chorus: A♭ B♭ E♭` |
| Sheet Music | Image paths separated by `;` → `sheet-music/basket-case-verse.png; sheet-music/basket-case-chorus.png` |

To add sheet music, put PNG/JPG/SVG images in the `sheet-music` folder and list their paths in that song's **Sheet Music** cell.

Empty cells show as "—" or "Not added yet". Add a new song by adding a new row.

## Using it offline on a tablet

The site saves itself on the device the first time you open it online (`sw.js` does this). After that it works with no internet. It saves every song page and every image listed in the **Sheet Music** column, including pages you haven't opened yet.

**iPad (Safari):** open the site, tap **Share → Add to Home Screen**, then open it **once from the new home-screen icon while you're online**. The home-screen app keeps its own saved copy, separate from Safari's. It's also the copy iPadOS won't clear when you don't use it for a while.

**Windows tablet (Edge or Chrome):** open the site, then choose **⋯ → Apps → Install this site as an app** (Edge) or the install icon in the address bar (Chrome).

**Updates:** when the tablet is online, the site picks up changes to `songs.tsv` right away and refreshes the other files in the background. Any change to the page files appears on the next visit after that. To force every device to re-download everything, change `VERSION` at the top of `sw.js` (for example `'v1'` → `'v2'`).

The "View on Hooktheory" button still needs internet, because it opens another website.
