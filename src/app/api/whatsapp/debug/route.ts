import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    
    const whatsappService = WhatsAppService.getInstance();
    
    // Get detailed status information
    const status = whatsappService.getStatus();
    const isInitialized = whatsappService.isInitialized();
    const hasClient = whatsappService.hasClient();
    
    // Get client info if possible
    let clientInfo = null;
    try {
      if (isInitialized && hasClient) {
        clientInfo = await whatsappService.getClientInfo();
      }
    } catch (error) {
      console.error('Error getting client info:', error);
    }
    
    return NextResponse.json({
      status,
      isInitialized,
      hasClient,
      clientInfo,
      timestamp: new Date().toISOString(),
      sessionUser: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    });
  } catch (error) {
    console.error('Error in WhatsApp debug endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get WhatsApp debug info',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
