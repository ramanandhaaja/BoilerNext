import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService from '@/lib/whatsapp-service';

export async function GET(req: NextRequest) {
  try {
    const whatsappService = WhatsAppService.getInstance();
    const status = whatsappService.getStatus();
    
    // Force initialization if not connected
    if (status.status !== 'connected') {
      console.log('WhatsApp not connected, attempting to initialize...');
      
      // Set up event listeners
      whatsappService.on('qr', (qr) => {
        console.log('QR Code received:', qr);
      });
      
      whatsappService.on('ready', () => {
        console.log('WhatsApp client is ready!');
      });
      
      // Initialize the client
      await whatsappService.initialize();
      
      // Get updated status
      const updatedStatus = whatsappService.getStatus();
      
      return NextResponse.json({
        message: 'Initialization attempted',
        previousStatus: status,
        currentStatus: updatedStatus,
        isInitialized: whatsappService.isInitialized(),
        hasClient: whatsappService.hasClient()
      });
    }
    
    return NextResponse.json({
      message: 'WhatsApp client status check',
      status,
      isInitialized: whatsappService.isInitialized(),
      hasClient: whatsappService.hasClient()
    });
  } catch (error) {
    console.error('Error in WhatsApp test endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check WhatsApp status',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
