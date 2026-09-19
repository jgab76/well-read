# Well Read

Jeremy’s shared bookshelf. A static, read-only website for GitHub Pages, with categories, author-last-name sorting, search, and online covers from Open Library.

## Publishing

In this repository’s **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/docs**, and Save. GitHub displays the live URL when publication finishes. No Netlify account, paid plan, or password is needed.

The repository and website are public. Anyone with the URL can read the collection. Only repository collaborators with write access can change the published data. Visitors cannot import books or edit categories. There are no website accounts or browser-local book lists.

## Update the collection

Export your Goodreads library at https://www.goodreads.com/review/import and run:

```sh
node scripts/import-goodreads.mjs /path/to/goodreads_library_export.csv
```

Review and commit `docs/books.json`. GitHub Pages then republishes automatically. The importer replaces the published collection with the export’s read books, excluding to-read and currently-reading titles. The initial 311-book collection is organized into 14 broad editorial categories. Per-book choices in `data/category-overrides.json` take precedence during imports; update that file to change a category permanently. For new books without an override, custom Goodreads shelves become categories, or Uncategorized is used when none exist. Existing categories are retained on reimport when the export has no custom shelf.

The CSV remains local and is ignored by Git. The public list contains only titles, authors, sorting names, categories, ISBNs, Goodreads IDs, and optional Open Library cover URLs. Reviews, ratings, reading dates, and other export fields are omitted. Do not upload the raw Goodreads CSV to this public repository.

The initial collection contains 311 read entries from Jeremy’s Goodreads export. Different editions remain separate when Goodreads lists them separately. Authors are alphabetized using Goodreads’ last-name field, with suffixes such as Jr. and III corrected. No sample books are mixed into the collection.

## Covers

Covers load from Open Library by ISBN or Goodreads ID. Unavailable covers display a title-and-author fallback. An optional `cover` field accepts an HTTPS Open Library cover URL. Availability and edition matching depend on Open Library’s catalog.

## Local preview

```sh
python3 -m http.server 4173 --directory docs
```

Open http://localhost:4173. Requires a modern browser; the import script uses Node.js. No dependencies or build step.
