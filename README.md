## Dune Forms

### What this app does

- **Build forms**: Add Text, Multiple choice, Checkboxes, and Rating fields; set required flags; reorder; save.
- **Share & collect**: Each saved form gets a URL for responses.
- **Analyze in real time**: See counts per option, average ratings, and recent text responses. Live updates stream via WebSockets as responses arrive.
- **Light/Dark UI**: Toggle dark mode; clean, accessible components built with Tailwind CSS.

### Repository layout

- **`api/`**: Go Fiber API, MongoDB persistence, and WebSocket hub
- **`web/`**: Next.js 13 App Router frontend (form builder, renderer, analytics UI)

### Prerequisites

- Node.js 20+
- Go 1.21+
- A running MongoDB (local or remote)
  -Docker

### Quick start (using docker)

- Run `docker compose build`
- Run `docker compose up -d`

3. Use the app

- Open `http://localhost:3000`.
- Click “New Form” to build and save a form.
- Share the “Open” link to collect responses.
- Visit the form’s “Analytics” to see live updates as responses are submitted.

### Shutting down the app

- Run `docker compose down -v`

### Environment variables

You should not need to add your own env variables as it should default to these automatically. I also commited the .env file for the frontend as it only referened the NEXT_PUBLIC_API_URL.

- API (`api/`):
  - **`MONGO_URI`**: Mongo connection string (default `mongodb://localhost:27017`).
  - **`MONGO_DB`**: Database name (default `formbuilder`).
  - **`PORT`**: API port (default `8080`).
- Web (`web/`):
  - **`NEXT_PUBLIC_API_URL`**: Base URL to the API, e.g. `http://localhost:8080`.

Notes:

- If `NEXT_PUBLIC_API_URL` is not set, the web app tries to infer `http(s)://<host>:8080` from the current page URL.
- CORS on the API is open by default for local development.

### API overview (selected endpoints)

- `GET /api/forms?limit=100` — list forms
- `POST /api/forms` — create form
- `GET /api/forms/:id` — fetch form
- `PUT /api/forms/:id` — update form
- `POST /api/forms/:id/responses` — submit a response
- `GET /api/forms/:id/analytics` — current analytics snapshot
- `GET /ws/forms/:id` — WebSocket stream for live analytics updates

### Frontend routes

- `/builder` — form builder
- `/forms` — list all forms
- `/forms/[id]` — public form renderer (submit responses)
- `/forms/[id]/analytics` — live analytics dashboard

### Challenges

I faced some difficulties with creating dynamic visualisations with the analytics and creating real time analytics with the time frame provided so I kept it relatively simple. I also noticed a few bugs I didn't have time to resolve regarding some of the analytics calculations for certain fields in forms. Given more time these areas would be where I would focus on improving, along with implementing more of the optional features. Given that I had to understand and navigate the Go Fiber framework as I had not used it before, it was a bit of a learning curve.

To check that the web socket functionality is working properly I would open two tabs (one with the form analytics) and one with a new user filling a form and saving it, to see the dashboard analyitics update in real time.
