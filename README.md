# Jülide Kahkeci — static academic website + Pages CMS

## Deployment (no build step)

Upload **the contents of this folder** to the root of your GitHub repository. The root must contain `index.html`, `.pages.yml`, `content/`, and `assets/`.

In **GitHub → Settings → Pages**, select **Deploy from a branch**, `main`, `/(root)`, then save. **Do not select GitHub Actions.** The site is complete static HTML and needs no custom workflow.

If your repository still has old `.github/workflows/deploy.yml`, `build.py`, or old per-entry `content/updates/` folders, remove those old files to reduce confusion. They are **not** part of this package.

## Edit via Pages CMS

1. Go to https://app.pagescms.org/ and sign in with GitHub.
2. Select the `judymaskoun/website` repository and branch `main`.
3. Select **Homepage and profile**, **Recent updates**, **Research projects**, **Publications**, **Awards**, etc.
4. For repeatable lists, select **Add item** to add a new object, fill in its fields, set **Show on website** to true, and **Save**.
5. The content is stored in `content/*.json`. The website reads these files in the visitor's browser. No build step, Python, or GitHub Actions is required.

Research photos and other images may be uploaded via Pages CMS. The homepage counters update from visible records.

## Notes

- There is pre-rendered content in the HTML for resilience; the browser loads the latest JSON after opening the page. When previewing via Finder (`file://`), the fallback content will appear but JSON fetches may be blocked. To preview the editable version locally, use `python3 -m http.server 8000` from this folder.
- Light/dark theme and publication search remain functional.
- Avoid adding private/confidential material to a public repository.
