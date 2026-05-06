# Nexugun Garage - Dynamic App

This project now runs as a dynamic web app using a Node.js + Express backend with JSON-file persistence.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

For auto-restart in development:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000`

## API endpoints

- `GET /api/cars`
- `GET /api/cars/:id`
- `POST /api/cars`
- `PUT /api/cars/:id`
- `DELETE /api/cars/:id`

### Example payload for create/update

```json
{
  "brand": "Lamborghini",
  "model": "Lamborghini Example",
  "year": 2026,
  "description": "Example description",
  "imagePath": "Images/Lamborghini/example.jpg",
  "engine": "6.5L V12",
  "topSpeed": "350 km/h",
  "price": "$500,000.00",
  "videoUrl": "Videos/example.mp4"
}
```
