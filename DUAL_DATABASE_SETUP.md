# Dual Database Setup Guide

This project uses two databases:
1. **Local PostgreSQL** (via Prisma) - For authentication and user data
2. **Supabase** (via Supabase SDK) - For real-time chat data

## Setup Instructions

### 1. Environment Variables

Make sure your `.env` file has the following variables:

```bash
# Local PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilerplatefinal?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://sbftdzhrujfuyjvhsckp.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 2. Local PostgreSQL Setup

1. Make sure PostgreSQL is installed and running locally
2. Create a database named `boilerplatefinal`
3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

### 3. Supabase Setup

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the SQL from `supabase-schema.sql`
6. Run the query to create the necessary tables

## Data Flow

### Authentication & User Data (Local PostgreSQL)

- User accounts, sessions, and authentication data are stored in the local PostgreSQL database
- This data is accessed using Prisma client (`db.ts`)
- NextAuth.js is configured to use this database for authentication

### Chat Data (Supabase)

- Conversations and messages are stored in Supabase
- This data is accessed using the Supabase SDK (`supabase.ts`)
- Real-time updates are handled by Supabase's real-time capabilities

## API Routes

### Authentication

- `/api/auth/*` - NextAuth.js routes for authentication

### Chat

- `/api/conversations` - GET: Fetch all conversations, POST: Create a new conversation
- `/api/conversations/[id]/messages` - GET: Fetch messages for a conversation, POST: Create a new message
- `/api/whatsapp` - GET: Get WhatsApp status, POST: Initialize WhatsApp
- `/api/whatsapp/send` - POST: Send a WhatsApp message
- `/api/whatsapp/takeover` - POST: Take over a conversation (admin or bot)

## React Hooks

Custom hooks are provided to interact with the API:

- `useWhatsAppStatus()` - Get WhatsApp connection status
- `useInitializeWhatsApp()` - Initialize WhatsApp connection
- `useConversations()` - Fetch all conversations
- `useCreateConversation()` - Create a new conversation
- `useMessages(conversationId)` - Fetch messages for a conversation
- `useSendMessage()` - Send a message
- `useTakeover()` - Take over a conversation (admin or bot)

## State Management

Zustand is used for state management:

- `useChatStore` - Store for chat-related state (conversations, messages, etc.)

## Troubleshooting

### Database Connection Issues

- **Local PostgreSQL**: Check that PostgreSQL is running and the `DATABASE_URL` is correct
- **Supabase**: Check that the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Missing Tables

- **Local PostgreSQL**: Run `npx prisma migrate dev` to create missing tables
- **Supabase**: Run the SQL from `supabase-schema.sql` to create missing tables
