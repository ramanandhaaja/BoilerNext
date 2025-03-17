import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService from '@/lib/whatsapp-service';
import qrcode from 'qrcode-terminal';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

// For storing QR code between requests
let currentQrCode: string | null = null;

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
    const status = whatsappService.getStatus();
    
    // Get client info if connected
    let clientInfo = null;
    if (status.status === 'connected') {
      try {
        clientInfo = await whatsappService.getClientInfo();
      } catch (error) {
        console.error('Error getting client info:', error);
      }
    }
    
    return NextResponse.json({
      status: status.status,
      qrCode: status.qrCode || currentQrCode,
      clientInfo
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}

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
    
    const whatsappService = WhatsAppService.getInstance();
    
    // Set up event listeners
    whatsappService.on('qr', (qr) => {
      currentQrCode = qr;
      
      // Also display QR in terminal for easy testing
      qrcode.generate(qr, { small: true });
    });
    
    // Clear QR code when authenticated
    whatsappService.on('authenticated', () => {
      currentQrCode = null;
    });
    
    // Clear QR code when ready
    whatsappService.on('ready', () => {
      currentQrCode = null;
    });
    
    // Initialize WhatsApp client
    await whatsappService.initialize();
    
    // Get the current status after initialization
    const status = whatsappService.getStatus();
    
    return NextResponse.json({ 
      success: true,
      status: status.status,
      qrCode: status.qrCode || currentQrCode,
      isInitialized: whatsappService.isInitialized(),
      hasClient: whatsappService.hasClient()
    });
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to initialize WhatsApp' },
      { status: 500 }
    );
  }
}

// Add a DELETE endpoint to logout
export async function DELETE(req: NextRequest) {
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
    await whatsappService.logout();
    
    // Clear QR code
    currentQrCode = null;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging out of WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
