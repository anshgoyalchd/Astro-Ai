# AstroAI

AstroAI is a full-stack Vedic astrology web app built from the supplied `/design` screens without redesigning the delivered UI. The frontend uses React + Tailwind CSS, and the backend uses Node.js, Express, MongoDB, Passport Google OAuth, JWT auth, Gemini, and Razorpay.

## Folder Structure

- `client/` React + Vite frontend
- `server/` Express + MongoDB backend
- `design/` original HTML/CSS design handoff

## Setup

1. Install dependencies from the project root:
   `npm install`
2. Create environment files:
   Copy `.env.example` values into your shell or into matching `.env` files for the root/server and client.
3. Start MongoDB locally or point `MONGODB_URI` at your cluster.
4. Configure Google OAuth:
   Add the callback URL `http://localhost:5000/api/auth/google/callback` in Google Cloud.
5. Configure Razorpay keys and Gemini API key.
6. Run the app:
   `npm run dev`

## Routes

- Frontend:
  - `/`
  - `/login`
  - `/register`
  - `/chat`
  - `/report/:chatId`
- Backend API:
  - `/api/auth`
  - `/api/user`
  - `/api/chat`
  - `/api/payment`

## Features

- Email/password auth + Google OAuth
- JWT-protected frontend routes
- Astrology intake form stored in MongoDB
- Cached Gemini-generated report per astrology profile
- Chat sessions with free and paid message gating
- Razorpay order creation and verification
- PDF report download for active Rs. 299 subscribers

## Notes

- Gemini secrets stay server-side only.
- Free users are capped at 5 user messages per chat session.
- Rs. 49 purchases add 10 credits.
- Rs. 299 purchases enable a 30-day unlimited subscription.
