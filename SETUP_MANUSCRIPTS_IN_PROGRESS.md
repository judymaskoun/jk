# Pages CMS — Manuscripts in progress visibility

The Publications page has a separate **Manuscripts in preparation** group. The new control is:

**Pages CMS → Section visibility (show / hide) → Publications — show manuscripts in progress**

- **On (default):** Manuscripts in preparation appear normally on Publications and in the automatically generated CV, and its count appears on the online CV.
- **Off:** The entire in-progress group and its spacing disappear from Publications; those manuscripts are omitted from the generated PDF, and their count disappears from the online CV summary.
- **Manuscripts submitted**, published articles, reviews, presentations and the individual manuscript records remain untouched.
- Switching the control back on restores all previously visible records.
- A manually uploaded CV is your own document, so this switch **cannot edit it**. It only controls the auto-generated PDF.

This is a presentation/visibility switch, not a deletion control; existing `content/publications.json` data is never changed.

## Install on your current repository without losing CMS edits

Use the SAFE zip and upload the four included website files to their matching paths.
Do **not** replace `content/sections.json`; your settings are retained. This new flag defaults to enabled when missing, and Pages CMS can save your choice into `content/sections.json` when you toggle it.
If you customized `.pages.yml` yourself, merge the newly added `show_publications_in_progress` field rather than overwriting that configuration.
When auto-CV is enabled, allow GitHub Actions to publish the newly generated PDF after your CMS save.
