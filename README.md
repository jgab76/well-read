# Well Read

Jeremy’s shared bookshelf. A static, read-only website for GitHub Pages, with categories, author-last-name sorting, search, and online covers from Open Library.

## Publishing

In this repository’s **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/docs**, and Save. GitHub displays the live URL when publication finishes. No Netlify account, paid plan, or password is needed.

The repository and website are public. Anyone with the URL can read the collection. Only repository collaborators with write access can change the published data. Visitors cannot change the published collection. The cover upload helper is visible to everyone, but saving a cover requires repository write access on GitHub. There are no website accounts or browser-local book lists.

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

## Upload or replace a cover

Open a book on the website and expand **Upload or replace cover**. Choose a JPEG, PNG, or WebP image (up to 10 MB). Download the prepared image, open the linked GitHub upload page, upload that exact file, and commit it to `main`. GitHub sign-in and repository permissions control publishing; no access tokens are stored in the bookshelf. The helper processes the image locally, converts it to JPEG, and limits the longest side to 1,200 pixels while preserving aspect ratio.

Custom covers are stored at `docs/covers/GOODREADS_ID.jpg`. The shelf checks for a custom cover first, then uses its catalog cover or title fallback. Custom covers remain in place after Goodreads reimports. Keep the prepared filename unchanged (remove any browser-added duplicate suffix). After GitHub Pages publishes, refresh the bookshelf or use **I’ve committed it — check cover**. A preview is not a published upload.

To revert to the catalog cover, remove the corresponding custom image in GitHub and allow Pages to republish.
