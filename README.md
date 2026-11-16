# Chidinma Onyemachi — Data Analyst Portfolio

This is the editable source for your GitHub Pages portfolio.

## Files and folders

- `index.html` — page structure and visual design.
- `projects.js` — the only file you normally need to edit to add, remove or update project cards.
- `assets/profile.jpg` — your homepage profile photograph.

## Update your contact email

The email is already set to `chidinmaa.onyemachi@gmail.com` in the Email Me button in `index.html`.

## Add a project

1. Open `projects.js`.
2. Find the `window.portfolioProjects = [` list.
3. Copy one complete project object (from `{` to `}`), including its comma where needed.
4. Paste it as a new item inside the array.
5. Change the title, category, description and tools.
6. Add a screenshot path, for example `assets/projects/fintech-dashboard.png`, after uploading that image.
7. Add real URLs in `githubUrl`, `dashboardUrl` or `caseStudyUrl`. Keep unused links as empty strings.
8. Save and commit the file.

Example project object:

```js
{
  "title": "Fintech Transaction Analytics",
  "category": "Financial analytics",
  "description": "Investigated transaction outcomes and payment-channel performance to identify failure patterns.",
  "tools": ["SQL", "Excel", "Power BI"],
  "image": "assets/projects/fintech-dashboard.png",
  "githubUrl": "https://github.com/your-username/your-project-repo",
  "dashboardUrl": "",
  "caseStudyUrl": ""
}
```

## Remove a project

In `projects.js`, delete the complete object for that project, including the comma separating it from neighbouring objects. Do not delete the square brackets around the full list.

## Edit a project

Change the text or links in that project's object. Keep quotation marks and commas.

## Add or replace a project screenshot

1. Create an `assets/projects` folder in the repository if it does not exist.
2. Upload a PNG or JPG screenshot into that folder.
3. In the relevant project object, set `image` to its relative path, e.g. `assets/projects/healthconnect.png`.
4. Commit both the image and `projects.js` changes.

## Replace your profile photo

Replace `assets/profile.jpg` with your new photo using the same filename. If GitHub asks whether to replace the existing file, confirm the replacement. The homepage already points to this path.

## Publish changes

1. Open your repository on GitHub.
2. Make sure you are on the branch and folder configured in Settings → Pages.
3. Upload or edit the files, preserving the folder structure.
4. Commit changes.
5. Wait for GitHub Pages to deploy. GitHub notes that publishing can take up to 10 minutes.
6. Hard-refresh your portfolio with `Ctrl + Shift + R` or check it in a private browser window.

## Important

- Keep `index.html`, `projects.js` and the `assets` folder in the same published root structure.
- File names and paths are case-sensitive on the published website.
- Only publish links that work and content you have permission to share.
- GitHub Pages is public. Do not upload private customer, patient or employer information.
