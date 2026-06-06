# TechField AI Setup

This project connects the AI chat to OpenAI through a Supabase Edge Function.

Do not put your OpenAI API key in the React `.env` file. Frontend environment variables are exposed to the browser. The OpenAI key must be stored as a Supabase secret and used only inside the Edge Function.

## Requirements

- A Supabase project
- Supabase CLI installed
- An OpenAI API key
- The `ai-chat` Edge Function included in this repository

## 1. Log in to Supabase

```powershell
supabase login
```

## 2. Link the Supabase project

Replace the project reference if you use a different Supabase project.

```powershell
supabase link --project-ref lqhrapdkfznzjuecenbh
```

## 3. Add the OpenAI API key as a Supabase secret

```powershell
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key
```

Optional model override:

```powershell
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_MODEL` is not set, the Edge Function uses its default model value.

## 4. Deploy the AI Edge Function

```powershell
supabase functions deploy ai-chat
```

## 5. Run the React app

```powershell
npm start
```

The React app calls the function with:

```js
supabase.functions.invoke('ai-chat')
```

If the Edge Function is not deployed or the `OPENAI_API_KEY` secret is missing, the app can still show a local fallback response, but real OpenAI-powered answers will not work.

## Security Notes

- Never commit `.env` files containing real secrets.
- Never expose `OPENAI_API_KEY` in frontend code.
- Use Supabase secrets for private API keys.
- Rotate the OpenAI key if it was ever pasted into public code, a public issue, or a GitHub repository.
