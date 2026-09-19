# Importing and saved removals

Run `node scripts/import-goodreads.mjs /path/to/goodreads_library_export.csv` from an up-to-date checkout. Pull the latest repository changes before importing so that owner removals are current.

`docs/exclusions.json` is the permanent removal list. The importer filters it by Goodreads book ID before writing books.json. The website also applies this list, so replacing books.json directly cannot make an excluded ID visible. Do not overwrite or regenerate exclusions.json during a sync. A changed Goodreads book ID (for example, a different edition) is a separate entry.

To remove a book, open its details, choose Remove from library, download exclusions.json, and upload that file to docs on GitHub. Commit it, wait for publication, then check the removal. Save one removal at a time and check publication before preparing the next, to avoid overwriting a pending update with an older list.

To restore a book, remove its entry from exclusions.json and commit. If an import already omitted it from books.json, reimport your Goodreads export after restoring it. The app never changes Goodreads itself.

Missing or invalid exclusion data causes the import to fail rather than accidentally restoring removed books. Keep the file even when its books array is empty.
