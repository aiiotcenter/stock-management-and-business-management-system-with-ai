# TechField AI Setup

OpenAI key frontend `.env` dosyasina konmaz. Key Supabase Edge Function secret olarak saklanir.

## 1. Supabase CLI login

```powershell
supabase login
```

## 2. Project link

```powershell
supabase link --project-ref lqhrapdkfznzjuecenbh
```

## 3. OpenAI secret ekle

```powershell
supabase secrets set OPENAI_API_KEY=sk-...
```

Opsiyonel model override:

```powershell
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

## 4. Function deploy

```powershell
supabase functions deploy ai-chat
```

## 5. Uygulama

React tarafinda `supabase.functions.invoke('ai-chat')` kullaniliyor. Function deploy edilmediyse chat yerel fallback ile cevap verir ama gercek OpenAI calismaz.
