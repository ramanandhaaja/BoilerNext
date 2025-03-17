import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    
    const { phone, message, conversationId, isAdmin = false } = await req.json();
    
    if (!phone || !message || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const whatsappService = WhatsAppService.getInstance();
    
    try {
      let result;
      if (isAdmin) {
        result = await whatsappService.adminSendMessage(
          phone, 
          message, 
          conversationId, 
          session.user.id
        );
      } else {
        result = await whatsappService.sendMessage(phone, message, conversationId);
      }
      
      return NextResponse.json({ success: true, message: result });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Check if it's an initialization error
      if (error instanceof Error && 
          (error.message.includes('not initialized') || 
           error.message.includes('initialization failed'))) {
        return NextResponse.json(
          { 
            error: 'WhatsApp client not initialized', 
            message: 'Please initialize WhatsApp by clicking the Connect WhatsApp button and scanning the QR code.'
          },
          { status: 503 }  // Service Unavailable
        );
      }
      
      // Other errors
      return NextResponse.json(
        { error: 'Failed to send message', message: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in WhatsApp send API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
