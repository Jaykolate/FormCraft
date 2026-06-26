# FormCraft 📝✨

FormCraft is a high-fidelity, no-code form builder platform that allows creators to design custom interactive forms, share them with public users, collect responses, and analyze metrics in real-time.

---

## Features

- **Drag-and-Drop Workspace**: Interactive builder canvas powered by `react-beautiful-dnd` with 9 supported field types.
- **Dynamic End-User Previews**: Real-time interactive preview toggle to test form inputs before publishing.
- **Advanced Field Analytics**: Detailed reporting dashboard that calculates total submissions, average scores, option distributions, and device/browser statistics.
- **Nodemailer Notifications**: Automated background email notifications sent directly to form owners upon submission.
- **CSV Data Exporter**: Quick Blob-based client-side CSV downloads for raw submission records.
- **Clerk Authentication**: Integrated auth wrapper protecting developer workspaces, editing views, and stats dashboards.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS v4, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, Nodemailer |
| **Database** | MongoDB, Mongoose |
| **Auth** | Clerk (React SDK & Backend Node SDK) |

---

## API Endpoints Reference

### Form Campaigns (`/api/forms`)
- `POST /api/forms` - Create new campaign (Auth required)
- `GET /api/forms` - Fetch all campaigns belonging to creator (Auth required)
- `GET /api/forms/:slug` - Fetch public schema properties by slug (Public)
- `PUT /api/forms/:id` - Update form fields/settings by ID (Auth required, owner only)
- `DELETE /api/forms/:id` - Cascading delete form and responses by ID (Auth required, owner only)

### Response Submissions (`/api/responses`)
- `POST /api/responses/:slug` - Submit response to form (Public, triggers email notifications)
- `GET /api/responses/:formId` - Fetch paginated submissions list (Auth required, owner only)

### Metric Aggregations (`/api/analytics`)
- `GET /api/analytics/:formId` - Fetch calculated statistics, averages, and distributions (Auth required, owner only)

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- Local MongoDB instance or Atlas connection string

### 1. Clone & Setup Backend Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment config
cp .env.example .env
```

Define environment values in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/formcraft
CLERK_SECRET_KEY=your_clerk_secret_key
EMAIL_USER=your_nodemailer_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 2. Setup Client Frontend
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install --legacy-peer-deps

# Create environment config
cp .env.example .env
```

Define environment values in `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

### 3. Run Applications
- Start Backend Server: `npm run dev` (runs on `http://localhost:5000`)
- Start Frontend Client: `npm run dev` (runs on `http://localhost:5173`)

---

## Deployment Configuration

### Frontend (Vercel)
The client project includes a `client/vercel.json` file configuring SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Set the Vite env variable `VITE_CLERK_PUBLISHABLE_KEY` in Vercel to match your production Clerk credentials.

### Backend (Render / Heroku)
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- Set `MONGO_URI`, `CLERK_SECRET_KEY`, `EMAIL_USER`, and `EMAIL_PASS` in your environment config variables.
