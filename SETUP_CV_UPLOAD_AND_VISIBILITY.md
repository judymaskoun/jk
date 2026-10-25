# Manual PDF override + whole-CV visibility — GitHub Pages / Pages CMS

This update works with the automatic CV generator from the preceding package. In Pages CMS you can choose an uploaded PDF, auto-generated PDF, or no publicly listed CV page.

## Install into your EXISTING repository

1. Extract the SAFE ZIP and upload each file to its matching GitHub path. Commit to `main`.
2. Keep your existing `content/*.json` files; the safe ZIP does not replace them.
3. Confirm GitHub → Settings → Pages → Build and deployment → Source is **GitHub Actions**.
4. In GitHub → Actions, verify **Publish website and refresh CV PDF** completes successfully. Wait for deployment to finish before checking the live website.
5. In Pages CMS, open **CV — Introduction and PDF upload**. You can now upload a PDF under **Upload my CV (PDF) — overrides automatic version**. Save it to your repo using Pages CMS.
6. The CV download button will link to that PDF. Clear the upload field and save to use the automatically generated PDF again.

## Three separate controls

- **CV — show entire CV page and menu links**: in Pages CMS → Section visibility (show / hide). Set Off to hide the CV navigation and not deploy the CV page or selected PDF; CMS records remain editable. Set On to restore it.
- **CV — show downloadable PDF button**: set Off to remove only the download button, leaving the online CV page visible.
- **CV — Introduction and PDF upload → Upload my CV**: upload optional PDF. When set, this file overrides the auto-generated PDF as the *download target*. Clear it to resume downloading the automatically generated CV. No extra toggle needed.

## Important distinctions

- The generator continues producing an updated PDF in the deployment build so it is ready when the uploaded override is cleared. Your uploaded PDF is *not edited* as CMS records change.
- Uploading a PDF does not replace the online CV content or its records; it only changes the file downloaded from the button.
- Hiding the full CV page also removes its navigation links site-wide and excludes `/cv/index.html` and the currently selected PDF from new GitHub Actions deployments. If your site remains configured to deploy directly from a branch, GitHub will ignore this exclusion—switch to GitHub Actions.
- Public GitHub repository files and their history remain public, and previously cached site/PDF URLs may continue to work temporarily. Visibility controls are for presentation, not confidential document storage.
- If `content/cv.json` already contains an `intro` field and no `uploaded_pdf`, the new field simply starts empty. Same with `content/sections.json` and `show_cv_page`, which defaults to On. You do not need to replace either file to activate the editor fields.
- If you previously customized `.pages.yml` or `assets/content.js`, merge the changes instead of overwriting them.
