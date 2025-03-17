import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

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
    
    const { conversationId, action } = await req.json();
    
    if (!conversationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const whatsappService = WhatsAppService.getInstance();
    
    let result;
    if (action === 'admin') {
      result = await whatsappService.adminTakeOver(conversationId, session.user.id);
    } else if (action === 'bot') {
      result = await whatsappService.botTakeOver(conversationId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, conversation: result });
  } catch (error) {
    console.error('Error in takeover:', error);
    return NextResponse.json(
      { error: 'Failed to perform takeover' },
      { status: 500 }
    );
  }
}
