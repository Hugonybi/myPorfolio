# Student Portfolio and Academic Planner

A responsive, five-page academic portfolio and planner, built with plain HTML, CSS and JavaScript. There are no frameworks and no build step, so every file can be read and edited directly.

- **Live site:** [add the GitHub Pages link here]
- **Repository:** https://github.com/your-username/student-portfolio

## Pages

| Page | File | What it shows |
| --- | --- | --- |
| Home | `index.html` | Photo, name, welcome message, navigation, brief biography |
| About | `about.html` | Educational background table, career aspirations, technical skills, hobbies, audio introduction |
| Projects | `projects.html` | Three sample projects with screenshots, descriptions, links and category filters |
| Academic planner | `planner.html` | Add, complete, filter and delete tasks, saved in the browser |
| Contact | `contact.html` | Form with name, email, phone and message, validated in JavaScript |

## Requirements checklist

| Requirement | Where it is met |
| --- | --- |
| Semantic HTML (`header`, `nav`, `main`, `section`, `article`, `figure`, `footer`) | All pages |
| Forms | `contact.html`, `planner.html` |
| Tables | `about.html` (academic history) |
| Images | `index.html`, `projects.html` |
| Hyperlinks | Navigation, project links, contact details, footer |
| Lists | Navigation, skills, hobbies, planner, project technologies |
| Multimedia (audio) | `about.html` (audio introduction with transcript) |
| External stylesheet | `css/style.css` |
| Responsive design, Flexbox and Grid | `css/style.css` (breakpoints at 640px and 960px) |
| Navigation styling and mobile menu | `css/style.css`, `js/main.js` |
| Animations and transitions | `css/style.css` (reveal, hover, floating photo; all switched off for reduced motion) |
| Consistent colour scheme | Colour tokens at the top of `css/style.css` |
| Event handling and DOM manipulation | `js/main.js`, `js/planner.js`, `js/contact.js` |
| Form validation | `js/contact.js` (non-empty fields, email format, digits-only phone) |
| Dynamic content updates | `js/planner.js` (live summary and task list), `js/main.js` (greeting, project filter) |
| Arrays and functions | `js/planner.js` (tasks array and task functions), `js/contact.js` (validation functions) |
| Interactive task management | `planner.html` and `js/planner.js` (add, complete, filter, delete, clear completed) |

## Before submitting

Replace every placeholder in square brackets, then work through this list:

- [x] `images/profile-placeholder.svg`: swapped for `images/me.jpg` in `index.html`
- [x] `media/intro.m4a`: own recording added, transcript written on `about.html`
- [ ] Projects: real titles, descriptions, screenshots and links, or keep the samples and label them
- [ ] Social links and contact details in the footer and on `contact.html`
- [ ] The live link and repository link at the top of this file

## Run locally

Open `index.html` in a browser, or serve the folder with Python:

```bash
python -m http.server 8080
```

Then visit http://localhost:8080

## Notes

- The contact form validates input but does not send email, because the site has no backend. A form service such as Formspree can be connected later.
- Planner tasks are stored in the browser's `localStorage`, so they stay on the device where they were created.
