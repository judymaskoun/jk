# Automatically generated downloadable CV

The CV PDF is now built from Pages CMS records on every website deployment.
Read [`SETUP_AUTOMATIC_CV.md`](SETUP_AUTOMATIC_CV.md) before uploading the patch: GitHub Pages must publish via GitHub Actions, and Pages CMS has a toggle to hide/reveal the Download CV button independently.

---

# Editable Contact cards — October 2026

The Contact page now has its own **Contact — cards and headings** editor in Pages CMS.
Edit the page title, the green heading, both card labels, both bold card headings,
the address text (including multiple lines), the displayed email label, the
email recipient, and optional notes. Saving the new JSON automatically updates
Contact on GitHub Pages. No additional build step is required.

### Updating an EXISTING website (recommended)

Use the SAFE ZIP and upload its files into their matching paths on GitHub:

- `.pages.yml` (adds the Contact editor)
- `content/contact.json` (NEW file; set to the contact text shown in the latest site)
- `assets/content.js` (renders the new editable fields)
- `contact/index.html` (matching static fallback)

The update does NOT replace `content/site.json` or your other content records.
If you already edited `.pages.yml` or `assets/content.js` on GitHub since the
previous ZIP, merge the corresponding changes rather than overwriting them.

**Important:** after this update, edit the address and email for the Contact
cards under **Contact — cards and headings**, not **Homepage and profile**.
Your footer institution/location remain editable under Homepage and profile.
If you've customized the old contact email/address in `site.json`, copy those
values to `content/contact.json` before uploading.

### Testing

The address and email cards render their JSON content when available; if the
JSON fails to load, the static fallback text remains visible. The existing
contact profile icons in the footer and all other sections remain unchanged.


**NEW:** Editable uploaded CV PDF override and whole CV page visibility. See SETUP_CV_UPLOAD_AND_VISIBILITY.md.

### October 2026 Teaching and CV fixes

- Teaching uses **one** authoritative renderer for nine Course Instruction / Teaching Assistant records plus two Teaching Development records. If JSON is unavailable, the HTML fallback retains all 11.
- All CMS `visible` and `order` fields remain supported.
- CV sections show only compact green labels; large duplicate headings are visually removed, while their DOM markers remain for CMS compatibility.
- Automatically generated PDF uses the traditional compact academic-CV layout, omits the introductory tagline, and spells out the word “and” instead of ampersands.
- Uploaded CV override, PDF button toggle, entire CV page visibility and GitHub Actions publishing remain unchanged.
