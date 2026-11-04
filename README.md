# Prachee Mahapatra — Portfolio

A static site with no build step. All of the text lives in **`content.json`**, so you update the site by editing that one file.

```
index.html     page structure (rarely needs changes)
styles.css     colours, fonts, layout
app.js         reads content.json and builds the page
content.json   ← YOUR CONTENT: edit this
```

## Updating your content

1. Open `content.json` and edit, add or remove entries.
2. Commit and push. GitHub Pages or Vercel redeploys automatically within a minute or so.

Common updates:

| You want to… | Do this in `content.json` |
|---|---|
| Add a project | Copy one `{ … }` block in `"projects"`, paste it, and change the text. Put it first in the list to show it as `01`. |
| Put a project under a filter | Set `"categories"` to the filter ids, e.g. `["ai", "backend"]`. Add new filters under `"projectFilters"`. |
| Link a project to a repo or demo | Fill in `"link": "https://…"`. A "View project" link appears. |
| Add a job | Copy a block in `"experience"` and set `"start"` to its start month as `"YYYY-MM"`. Jobs sort themselves newest first, and the newest opens by default. The order in the file doesn't matter. |
| Change the rotating words | Edit `"hero" → "roles"`. |
| Add or remove a stat | Edit `"stats"`. If you delete all of them, the strip disappears. |
| Add social links | Edit `"site" → "links"`. Entries with an empty `"url"` are hidden. |
| Change the accent colour | `"site" → "accent"` sets the dark-mode colour, e.g. `"#59B5D2"`. `"accentOnLight"` is a darker shade of it used for text in light mode, so it stays readable. |
| Add a skill | Add it to the `"items"` list of a group in `"skills"`, or add a whole new `{ "group": …, "items": [...] }` block. |

**JSON tips:** use double quotes, put commas between items but **not after the last one**, and don't add comments. If the page shows "Could not load content.json", paste the file into https://jsonlint.com to find the mistake.

## Previewing on your computer

Browsers block `content.json` when you open `index.html` by double-clicking, so run a tiny server from this folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(With VS Code, the "Live Server" extension does the same thing.)

## Deploying

**GitHub Pages:** push this folder to a repo, then go to Settings → Pages → Deploy from branch → `main` / root. Your site will be at `https://<username>.github.io/<repo>/`. If the repo is named `<username>.github.io`, it's served at the root.

**Vercel:** click "Add New → Project", import the repo, choose Framework Preset "Other", and deploy. You don't need to configure a build.

Both let you add a custom domain later.
