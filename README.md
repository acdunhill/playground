# Deep playground

Deep playground is an interactive visualization of neural networks, written in
TypeScript using d3.js. We use GitHub issues for tracking new requests and bugs.
Your feedback is highly appreciated!

**If you'd like to contribute, be sure to review the [contribution guidelines](CONTRIBUTING.md).**

## Development

To run the visualization locally, run:
- `npm i` to install dependencies
- `npm run build` to compile the app and place it in the `dist/` directory
- `npm run serve` to serve from the `dist/` directory and open a page on your browser.

For a fast edit-refresh cycle when developing run `npm run serve-watch`.
This will start an http server and automatically re-compile the TypeScript,
HTML and CSS files whenever they change.

## For owners
To deploy the current code to GitHub Pages (https://acdunhill.github.io/playground/):

    npm run deploy

This builds the site into `dist/` and publishes it to the `gh-pages` branch
(using the `gh-pages` package). `dist/` is gitignored, so it is never committed
to `master` — the build output only lives on `gh-pages`.

This is not an official Google product.
