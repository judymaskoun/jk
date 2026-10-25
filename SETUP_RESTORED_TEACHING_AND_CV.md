# Restored Teaching and traditional auto-generated CV

## What was fixed

- The older `assets/content.js` Teaching renderer deleted the entire unified grid and reinserted **only Course Instruction** records, leaving 2 entries. The unified renderer sometimes missed its recovery event. It now delegates to one authoritative renderer, which preserves all course types, edits, sort order, visibility and development cards.
- The included `content/teaching.json` has **9 teaching entries** (two course-instruction positions, seven TA courses) and **2 teaching-development entries**. The page also ships all 11 entries as static fallback.
- The online CV now displays concise uppercase green headings such as **ACADEMIC APPTS** instead of duplicate large headings; the hidden headings still exist for the CMS renderer and tab labels.
- The automatic PDF generator now uses the earlier compact academic format, and it omits the generic introduction and writes `and` in place of ampersands. The PDF continues to read the editable CMS files.
- Existing manual PDF upload override and hide/download/CV-page toggles remain functional.

## Existing GitHub website: safe update

1. Back up or commit your current repository before uploading.
2. From `Julide_Restored_Teaching_CV_Safe_Update.zip`, copy the seven files listed below into their **same locations** in your repository, replacing the older versions:
    - `assets/content.js`
    - `assets/teaching-unified.js`
    - `assets/cv-compact-headings.css` (new)
    - `teaching/index.html`
    - `cv/index.html`
    - `scripts/generate_cv.py`
    - `assets/documents/julide-kahkeci-cv.pdf` (initial build)
3. Commit the update. Check the `Actions` tab to confirm your PDF publishing workflow completes; your existing Pages source must remain set to GitHub Actions.
4. Check Teaching > **Courses** and **Development**. The expected CMS list is 9 course records and 2 development records.
5. Leave your existing `content/` folder and `.pages.yml` untouched; this update doesn't overwrite CMS data.

### If your teaching records are missing **inside Pages CMS itself**

The safe update deliberately does not overwrite your `content/teaching.json`, to preserve edits already made on the site. The ZIP contains the original eleven-record backup under `OPTIONAL_BACKUP_DO_NOT_UPLOAD_DIRECTLY/teaching.json`. Compare it with your current `content/teaching.json` and restore **only** missing records, preferably through Pages CMS. Overwriting your current teaching JSON wholesale would discard any more recent edits or visibility choices.

### Notes

- The older PDF you attached contained more detailed descriptions than the current Pages CMS records. The automatic PDF can only include details stored in CMS. You can enrich those fields to restore longer bullet-level content, or choose your uploaded PDF instead.
- In Pages CMS, confirm `Section visibility` has **Teaching: Courses** and **Teaching: Development** enabled. Other section toggles still work.
- No change to your homepage, Research, Publications, contact content, Web of Science icon, current uploaded PDF, or other stored records is needed.
