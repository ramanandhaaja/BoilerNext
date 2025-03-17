# Creating Tables in Supabase - Step by Step Guide

Follow these steps to create the necessary tables in your Supabase database:

## Step 1: Log in to Supabase

1. Open your browser and go to https://app.supabase.com/
2. Log in with your credentials

## Step 2: Select Your Project

1. From the dashboard, select your project (with URL: https://sbftdzhrujfuyjvhsckp.supabase.co)

## Step 3: Open SQL Editor

1. In the left sidebar, click on "SQL Editor"
2. Click on "New Query" to create a new SQL query

## Step 4: Copy and Paste the SQL

1. Copy the entire SQL from the `supabase-schema.sql` file in your project
2. Paste it into the SQL Editor

The SQL should look like this:

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

## Step 5: Run the Query

1. Click the "Run" button to execute the SQL
2. You should see a success message indicating that the tables were created

## Step 6: Verify the Tables

1. In the left sidebar, click on "Table Editor"
2. You should now see two new tables:
   - `conversations`
   - `messages`
3. Click on each table to verify that they have the correct columns

## Step 7: Enable Realtime (Optional)

To enable real-time updates:

1. Go to "Database" in the left sidebar
2. Click on "Replication"
3. In the "Supabase Realtime" section, enable realtime for both tables:
   - `conversations`
   - `messages`

## Step 8: Test the Tables

After creating the tables, you can test them by:

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

If you encounter any issues:

1. Check the error message in the SQL Editor
2. Make sure you have the correct permissions to create tables
3. Verify that your Supabase URL and anon key are correct in the `.env` file
4. If you get a "relation already exists" error, that's fine - it means the tables are already created
