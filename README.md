# CV: Ihor Klymenko

Static one-page CV for GitHub Pages (`https://ihorklym.github.io/cv/`): `index.html` is Ukrainian, `en/index.html` is English, shared `assets/style.css` and `assets/main.js`; no build step.
To edit, change the text in both HTML files (they mirror each other section by section) and preview with `python3 -m http.server` run from the parent folder, then open `http://localhost:8000/cv/`.
Missing facts are placeholders: `grep -rn 'data-todo' index.html en/index.html` lists them; replace each `<span class="placeholder" data-todo="...">` with the real value (HTML comments next to contacts, the PDF button and the photo slot show the markup).
