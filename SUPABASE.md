# Supabase Integration

This project uses Supabase for real-time chat data management. The integration allows for efficient storage and retrieval of chat messages and conversations.

## Setting Up Supabase

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the project settings
4. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

The database schema is managed by Prisma, but the following tables are used for chat functionality:

- `User`: Stores admin user information
- `Conversation`: Stores conversation metadata
- `Message`: Stores individual messages

## Real-time Updates

Supabase provides real-time updates for chat messages, allowing for instant message delivery and updates to the UI when new messages arrive.

## API Integration

The WhatsApp service integrates with Supabase to store and retrieve messages. The following files are key to this integration:

- `src/lib/supabase.ts`: Sets up the Supabase client
- `src/lib/whatsapp-service.ts`: Handles WhatsApp message processing and storage
- `src/app/api/conversations/route.ts`: API endpoint for conversation management
- `src/app/api/conversations/[id]/messages/route.ts`: API endpoint for message management

## Authentication

Authentication is handled by NextAuth.js, but Supabase is used to store and retrieve chat data. The authentication flow ensures that only authorized users can access and manage conversations.
