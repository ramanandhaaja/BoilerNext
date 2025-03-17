# Supabase Setup Instructions

To fix the error with the missing `conversations` table, you need to create the necessary tables in your Supabase database.

## Steps to Create Tables in Supabase

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project: "sbftdzhrujfuyjvhsckp"
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the SQL below:

```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_phone TEXT NOT NULL,
  user_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  assigned_admin_id TEXT,
  is_bot_active BOOLEAN DEFAULT true NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_phone ON public.conversations(user_phone);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

6. Run the query by clicking the "Run" button
7. Verify that the tables were created by checking the "Table Editor" in the left sidebar

## Enabling Real-time Updates (Optional)

To enable real-time updates for your chat application:

1. Go to the "Database" section in the Supabase dashboard
2. Click on "Replication" in the sidebar
3. In the "Supabase Realtime" section, enable realtime for the following tables:
   - `conversations`
   - `messages`

## Setting Up Row-Level Security (RLS) Policies (Optional)

For better security, you can set up RLS policies:

1. Go to the "Authentication" section in the Supabase dashboard
2. Click on "Policies" in the sidebar
3. Select the `conversations` table
4. Click "Add Policy" and create policies for:
   - Read access: Allow authenticated users to read conversations
   - Write access: Allow authenticated users to create/update conversations

Repeat the same for the `messages` table.

## Testing Your Setup

After creating the tables, you can test your setup by:

1. Creating a test conversation through the API:
   ```
   POST /api/conversations
   {
     "user_phone": "+1234567890",
     "user_name": "Test User"
   }
   ```

2. Creating a test message through the API:
   ```
   POST /api/conversations/{conversationId}/messages
   {
     "content": "Hello, this is a test message",
     "sender_type": "admin"
   }
   ```

3. Verifying that the data appears in the Supabase Table Editor

## Troubleshooting

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify that your Supabase URL and anon key are correct in the `.env` file
3. Make sure the tables were created correctly in Supabase
4. Check that your API routes are correctly configured to use the Supabase client
