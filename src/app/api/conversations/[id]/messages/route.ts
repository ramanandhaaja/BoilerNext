import { NextRequest, NextResponse } from 'next/server';
import { fetchMessages, createMessage } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

/**
 * GET /api/conversations/[id]/messages
 * Fetches messages for a specific conversation
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the current session to identify the admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Access the id parameter from context
    const { id: conversationId } = await context.params;
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    const messages = await fetchMessages(conversationId);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching messages', 
        message: error instanceof Error ? error.message : String(error), 
        details: error 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Creates a new message for a specific conversation
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the current session to identify the admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Access the id parameter from context
    const { id: conversationId } = await context.params;
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'content is required' },
        { status: 400 }
      );
    }
    
    // Create message in Supabase
    const message = await createMessage({
      conversation_id: conversationId,
      sender_id: session.user.id,
      sender_type: body.sender_type || 'admin',
      content: body.content,
      media_url: body.media_url,
      media_type: body.media_type,
      timestamp: new Date().toISOString(),
      is_read: false
    });
    
    // Update conversation's last message
    const { updateConversationLastMessage } = await import('@/lib/supabase');
    await updateConversationLastMessage(conversationId, body.content);
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        error: 'Error creating message', 
        message: error instanceof Error ? error.message : String(error), 
        details: error 
      },
      { status: 500 }
    );
  }
}
