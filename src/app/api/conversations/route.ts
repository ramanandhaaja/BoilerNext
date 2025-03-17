import { NextRequest, NextResponse } from 'next/server';
import { fetchConversations, createConversation } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

/**
 * GET /api/conversations
 * Fetches all conversations from Supabase
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current session to identify the admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch conversations from Supabase
    const conversations = await fetchConversations();
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching conversations', 
        message: error instanceof Error ? error.message : String(error), 
        details: error 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Creates a new conversation in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current session to identify the admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.user_phone) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'user_phone is required' },
        { status: 400 }
      );
    }
    
    // Create conversation in Supabase
    const conversation = await createConversation({
      user_id: body.user_id || '',
      user_phone: body.user_phone,
      user_name: body.user_name || '',
      status: 'active',
      is_bot_active: true
    });
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { 
        error: 'Error creating conversation', 
        message: error instanceof Error ? error.message : String(error), 
        details: error 
      },
      { status: 500 }
    );
  }
}
