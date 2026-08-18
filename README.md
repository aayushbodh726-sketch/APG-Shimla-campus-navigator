# APG Shimla Campus Navigator

A browser-based campus map and walking navigator for APG Shimla University.

## What is included

The frontend is available from `index.html` and retains the original Leaflet/OpenStreetMap map interface. The updated directions flow is destination-first: it uses the user’s exact live GPS position automatically, continuously tracks movement, shows accuracy and permission status, refreshes the route while moving, and provides turn instructions when the pedestrian routing service returns them. Users can enable browser voice guidance for spoken instructions and arrival announcements.

The backend in `server.js` exposes the existing campus data APIs and now uses the OpenStreetMap Valhalla pedestrian router for mapped walking paths. If the external router is temporarily unavailable, the API returns an explicitly labelled approximate fallback instead of silently presenting a synthetic route as road guidance.

## Local development

Install dependencies and start the API:

```bash
npm install
npm start
```

Open `index.html` through a local web server rather than using `file://`, because browser geolocation requires a secure context or localhost. The frontend uses `http://localhost:3000/api` when opened on localhost and the deployed Render API in production.

## Deployment

Deploy `index.html` as the Netlify site entry point. Deploy `server.js` as the Node service at `https://apg-shimla-campus-navigator.onrender.com`, or update the `API_BASE` constant in the frontend if the backend URL changes. The Render service must have the dependencies in `package.json` installed and listen on the `PORT` environment variable.

## Important data note

The campus buildings currently use the coordinates stored in the repository. For production-grade turn-by-turn accuracy, replace those approximate points with surveyed building entrances and add mapped campus paths or a private routing graph for areas not covered by OpenStreetMap.
