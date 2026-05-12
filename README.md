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

## Admin login

- Admin login page: `/admin-login.html`
- Admin console page: `/admin.html`
- Protected mutation APIs: `POST/PUT/DELETE /api/cars`
- Session duration: 24 hours (HTTP-only cookie)

Environment variables (recommended):

```bash
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
SESSION_SECRET=your_long_random_secret
```

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
