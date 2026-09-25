"""Inline build/data.js and src/app.js into src/template.html.

Writes index.html (a complete document, for GitHub Pages or opening locally)
and build/artifact.html (body-only, for publishing as a claude.ai artifact).
"""
t = open("src/template.html").read()
d = open("build/data.js").read()
body = t.replace("/*DATA*/", d).replace("/*APP*/", open("src/app.js").read())
open("build/artifact.html", "w").write(body)
head, rest = body.split("</style>", 1)
open("index.html", "w").write(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head + "</style>\n</head>\n<body>\n" + rest.strip() + "\n</body>\n</html>\n"
)
