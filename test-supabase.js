// Simple script to test Supabase connection and create a test conversation
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by listing tables
    const { data: tables, error: tablesError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      if (tablesError.code === 'PGRST116') {
        console.error('Error: Table "conversations" does not exist. Please create the tables using the SQL script.');
        console.log('Follow the instructions in SUPABASE_TABLES_GUIDE.md to create the tables.');
      } else {
        console.error('Error fetching tables:', tablesError);
      }
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Existing conversations:', tables);
    
    // Create a test conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([
        {
          user_phone: '+1234567890',
          user_name: 'Test User',
          status: 'active',
          last_message: 'Hello, this is a test message',
          last_message_time: new Date().toISOString(),
          is_bot_active: true
        }
      ])
      .select();
    
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return;
    }
    
    console.log('Successfully created test conversation:', conversation);
    
    // Create a test message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversation[0].id,
          sender_type: 'admin',
          content: 'Hello, this is a test message',
          timestamp: new Date().toISOString(),
          is_read: false
        }
      ])
      .select();
    
    if (messageError) {
      console.error('Error creating message:', messageError);
      return;
    }
    
    console.log('Successfully created test message:', message);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();
