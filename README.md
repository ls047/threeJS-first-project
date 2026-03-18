# Solar System Visualization

An interactive 3D solar system built with [canvas-sketch](https://github.com/mattdesl/canvas-sketch) and Three.js. Click planets to view scientific details.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:9966 in your browser.

## Build for deployment

```bash
npm run build
```

This produces static HTML and JS in the `public/` folder, ready to deploy to Vercel, Netlify, or any static host.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the project
3. Vercel will auto-detect the build settings (see `vercel.json`)

No additional configuration needed—the project builds to static files that work without a server.
