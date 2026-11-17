# Demo catalogue

The JSON preserves the 12 titles, artists, prices and cover filenames from phase 1.
Missing descriptions, dates and formats are demonstration values, not verified discographic facts.
The four original reviews belong to the first album; their dates have been adjusted for the demo.
The remaining albums contain one fictional demonstration review each.
Review titles are unique within each album. Reviews have no images.

Copy the 12 cover files from public/images into data/images, keeping their exact filenames.
Keep public/images for now: the pages still use static image URLs until commits 4 and 5.
Original images in data/images are versioned. Runtime copies in uploads are not.

Run commands from the project root. Startup requires MongoDB at
mongodb://127.0.0.1:27017 and uses the musix database, albums collection.
The application copies missing demo images on every startup without overwriting existing files.
It inserts demo documents only when the albums collection is empty.
Restarting a non-empty catalogue does not restore deleted albums or overwrite edited documents.
If all albums are deleted, restarting seeds the catalogue again.
MongoDB generates album IDs; the seed code generates ObjectIds for embedded reviews.
