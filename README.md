# TechField

TechField is a field service management web app for technical teams that manage jobs, employees, inventory, customer stock, live employee locations, and AI-assisted operations.

The app is built with React and Supabase. It includes separate admin and employee experiences, plus an optional OpenAI-powered assistant through a Supabase Edge Function.

## Features

- Admin dashboard with active jobs, inventory metrics, and stock status
- Employee management with roles, status, and profile details
- Main inventory management with warehouse/category fields
- Employee stock assignment and tracking
- Customer stock tracking after sales or product transfers
- Customer management
- Job management with assignment, reassignment, status updates, and photo uploads
- Employee job view with job closing and stock usage
- Live employee location tracking with Google Maps embed
- AI chat with safe approval-based database actions
- Turkish and English language selection

## Tech Stack

- React 18
- Create React App
- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Edge Functions
- OpenAI API
- lucide-react

## Project Structure

```text
techfield/
  public/
  src/
    lib/supabase.js
    App.js
    App.css
  supabase/
    functions/
      ai-chat/
        index.ts
  supabase_full_setup.sql
  supabase_next_changes.sql
  OPENAI_AI_SETUP.md
  package.json
```

## Getting Started

Install dependencies:

```powershell
npm install
```

Create a local `.env` file in the project root:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

Start the development server:

```powershell
npm start
```

The app will usually run at:

```text
http://localhost:3000
```

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase_full_setup.sql`.
4. Run `supabase_next_changes.sql`.
5. Create users in Supabase Auth.
6. Make sure each Auth user has a matching row in `public.profiles`.

For admin access, the logged-in Auth user's ID must match `profiles.id`, and the profile row must have:

```text
role = admin
active = true
```

## OpenAI AI Setup

OpenAI is connected through a Supabase Edge Function. Do not expose the OpenAI API key in frontend code.

See:

[OPENAI_AI_SETUP.md](./OPENAI_AI_SETUP.md)

## Useful Commands

Run the app:

```powershell
npm start
```

Create a production build:

```powershell
npm run build
```

Deploy the AI Edge Function:

```powershell
supabase functions deploy ai-chat
```

## Environment Variables

Frontend variables:

```env
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

Supabase Edge Function secrets:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

`OPENAI_MODEL` is optional.

## Security Notes

- Do not commit real `.env` files.
- Do not commit API keys.
- Do not put `OPENAI_API_KEY` in React environment variables.
- Use Supabase secrets for private keys.
- If a key was committed by mistake, rotate it immediately.

## License

This project is private by default. Add a license before publishing it as an open-source project.
