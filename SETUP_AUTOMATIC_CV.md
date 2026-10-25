# Automatic downloadable CV — installation and setup

This update adds a **real PDF**, generated from the same Pages CMS JSON content as the website. It is regenerated *on GitHub* when changes are committed, then the website and new PDF are deployed together.

## What is generated

The PDF takes the name, degree/subtitle, email/location, and CV introduction from the site/contact/CV content. It then incorporates the **Visible** records from Education, Experience, Teaching, Service, Research Funding, Awards, Affiliations, Skills, Publications, and Presentations, subject to the corresponding **CV section visibility** settings in Pages CMS.

It is not a conversion of an old manually uploaded PDF. Text that exists **only** in your former PDF and not in the CMS records will not appear until you add it to the CMS content. Save a copy of the old PDF first if it contains extra information.

## Install to your existing GitHub repository

1. Save a backup of your current `assets/documents/julide-kahkeci-cv.pdf`, if you want to retain it.
2. Extract the **SAFE ZIP**, keeping the folders. Upload/replace each file at the **same path** in the GitHub repository:
   - `.pages.yml` — adds the PDF visibility toggle and removes the manual CV PDF upload field.
   - `cv/index.html` — points Download CV at the generated PDF.
   - `assets/content.js` — prevents a legacy manually set PDF path from overriding the generated PDF.
   - `assets/section-visibility.js` — shows/hides the download button based on the CMS setting.
   - `assets/documents/julide-kahkeci-cv.pdf` — initial PDF from the bundled CMS records.
   - `scripts/generate_cv.py` — generates the PDF from `content/*.json`.
   - `.github/workflows/pages-with-auto-cv.yml` — automatically builds and deploys site + PDF.
   - `SETUP_AUTOMATIC_CV.md` — this guide.
3. **Do not replace any `content/*.json` file** from the SAFE ZIP. Your real Pages CMS records remain yours. If you have customized `.pages.yml` or either JS file since the previous package, merge these changes instead of overwriting them.
4. Commit the files to your repository's **main** branch. If your Pages branch has another name, edit the workflow's `branches: [main]` to your branch name.
5. Go to your GitHub repository **Settings → Pages → Build and deployment → Source → GitHub Actions** (not “Deploy from a branch”). This is required: a workflow-generated PDF otherwise may not publish from a branch build.
6. In **Actions**, open **Publish website and refresh CV PDF**. Verify it runs to completion. Use **Run workflow** once if necessary. If GitHub has Actions disabled, enable them in repository settings.
7. Open your website's **CV** page and select **Download CV (PDF)**. It will download the version generated from the current Pages CMS records.

### To hide or restore the PDF download

In Pages CMS, edit **Section visibility (show / hide) → CV — show downloadable PDF button**, then save. **Off** removes the button from the CV page without leaving a gap; **On** restores it. It does not remove the online CV or delete the PDF file from the public website (someone who knows the direct PDF URL may still access it).

### Automatic updates

Every successful save to the repository's main branch—including a Pages CMS save—triggers the workflow. The action generates a fresh PDF using the latest content and deploys the updated site and PDF **together**. The live PDF updates after the deployment completes, not at the instant you click Save. A failed Actions run will leave the previously deployed site/PDF intact; review the Actions log.

### Notes

- The CMS's former manual “CV PDF” field under “Homepage and profile” is intentionally removed; edit the source records instead.
- The new visibility flag is optional in your existing `content/sections.json`; the default is to **show** the button until you change the switch in Pages CMS.
- Existing online CV section show/hide settings also affect the generated PDF sections. Hidden individual records are also excluded.
- No separate paid services, API keys, personal access tokens, or custom domain are required. GitHub Actions will install ReportLab and system DejaVu fonts in its runner; no font files are included in the repository package.
- If you already have another custom Pages deployment workflow, disable it or merge the PDF-generation step into that workflow to avoid competing deployments.
