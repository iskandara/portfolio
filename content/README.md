# Content (your CMS)

All Work-page content lives in **works.json**. Edit that file, save, reload — the
site re-renders. `index.html` is presentation only; you never touch it to change content.

## Structure
```
{ "works": [ { ...project... }, { ...project... } ] }
```

## Project fields
| field      | what it is |
|------------|------------|
| `id`       | unique slug, used in the URL (`#work/<id>`). No spaces. |
| `title`    | card + tab title |
| `cat`      | small category label on the card |
| `cats`     | array for the filter chips: any of `design`, `development`, `ecommerce`, `research` |
| `url`      | external site (the "Visit site" button). `""` hides it |
| `thumb`    | card image path. `""` shows a placeholder frame |
| `heading`  | big case-study title (supports `<b>bold</b>`) |
| `summary`  | short intro paragraph |
| `challenge`| the "The Challenge" paragraph |
| `role` / `client` / `time` | meta values (use `\n` for a line break) |
| `cover`    | lead image path under the header. `""` = placeholder |
| `sections` | ordered list of blocks (below) |

## Section types
```jsonc
{ "type":"banner",  "image":"", "title":"Big statement" }
{ "type":"heading", "kicker":"meeting #1", "title":"First Cup of Coffee" }
{ "type":"text",    "body":"A paragraph. A blank line makes a new paragraph." }
{ "type":"quote",   "body":"A pulled quote." }
{ "type":"list",    "label":"// What are we building?", "ordered":true, "items":["A","B"] }
{ "type":"note",    "body":"A highlighted call-out box." }
{ "type":"image",   "image":"", "caption":"optional caption" }
{ "type":"gallery", "images":["","",""] }
{ "type":"colors",  "label":"A dance with colors", "groups":[
    { "name":"Existing", "swatches":["#2f6fb0","#f4a13c"] },
    { "name":"Proposed", "swatches":["#12329a","#ffd21f"] } ] }
```

## Images
Set any `image` / `thumb` / `cover` to a path or URL, e.g. `"images/shot.jpg"`.
Put the files anywhere you like (an `images/` folder next to this one is tidy).
Leave `""` to keep the placeholder.

## Note
`works.json` must stay valid JSON — double quotes, no trailing commas, no comments.
Paste it into jsonlint.com if a change ever breaks the page.
