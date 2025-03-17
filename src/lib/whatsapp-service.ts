import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  supabase, 
  createMessage, 
  fetchConversations, 
  ChatMessage, 
  Conversation 
} from './supabase';
import { EventEmitter } from 'events';

class WhatsAppService extends EventEmitter {
  private client: Client | null = null;
  private _isInitialized = false;
  private qrCode: string | null = null;
  private static instance: WhatsAppService;

  private constructor() {
    super();
    // Automatically try to initialize when the service is instantiated
    this.initialize().catch(error => {
      console.error('Error auto-initializing WhatsApp client:', error);
    });
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async initialize() {
    if (this._isInitialized) return;

    try {
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true
        }
      });

      // QR code event
      this.client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        this.qrCode = qr;
        this.emit('qr', qr);
      });

      // Loading screen event
      this.client.on('loading_screen', (percent, message) => {
        console.log('LOADING SCREEN', percent, message);
        this.emit('loading', { percent, message });
      });

      // Authentication event
      this.client.on('authenticated', () => {
        console.log('AUTHENTICATED');
        this.emit('authenticated');
      });

      // Authentication failure event
      this.client.on('auth_failure', (msg) => {
        console.error('AUTHENTICATION FAILURE', msg);
        this.emit('auth_failure', msg);
      });

      // Ready event
      this.client.on('ready', async () => {
        console.log('WhatsApp client is ready!');
        this._isInitialized = true;
        
        // Get WhatsApp Web version for debugging
        try {
          const wWebVersion = await this.client?.getWWebVersion();
          console.log(`WWeb Version: ${wWebVersion}`);
        } catch (error) {
          console.error('Error getting WWeb version:', error);
        }
        
        this.emit('ready');
      });

      // Message event
      this.client.on('message', async (msg: Message) => {
        if (msg.from === 'status@broadcast') return;
        
        console.log('MESSAGE RECEIVED', msg.body);
        
        try {
          // Get or create conversation
          const conversation = await this.getOrCreateConversation(msg.from);
          
          // Create message in database
          const messageData: Omit<ChatMessage, 'id'> = {
            conversation_id: conversation.id,
            sender_id: msg.from,
            sender_type: 'user',
            content: msg.body,
            timestamp: new Date().toISOString(),
            is_read: false
          };

          // If message has media
          if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            if (media) {
              // In a real implementation, you would upload this to storage
              // For now, we'll just store the mimetype
              messageData.media_type = media.mimetype;
            }
          }

          const savedMessage = await createMessage(messageData);
          
          // Update conversation with last message
          await this.updateConversationLastMessage(conversation.id, msg.body);
          
          // Emit the message for real-time updates
          this.emit('message', {
            message: savedMessage,
            conversation
          });
          
          // Process with AI if bot is active for this conversation
          if (conversation.is_bot_active && savedMessage) {
            this.processWithAI(savedMessage, conversation);
          }
        } catch (error) {
          console.error('Error processing incoming message:', error);
        }
      });

      // Message ACK event (message status)
      this.client.on('message_ack', (msg, ack) => {
        /*
          ACK VALUES:
          ACK_ERROR: -1
          ACK_PENDING: 0
          ACK_SERVER: 1
          ACK_DEVICE: 2
          ACK_READ: 3
          ACK_PLAYED: 4
        */
        // Only log the final acknowledgment state (read) to reduce console noise
        if (ack === 3) {
          console.log(`Message "${msg.body}" was read by the recipient`);
        }
        this.emit('message_ack', { message: msg, ack });
      });

      // Disconnected event
      this.client.on('disconnected', (reason) => {
        console.log('WhatsApp client disconnected', reason);
        this._isInitialized = false;
        this.emit('disconnected', reason);
      });

      // Change state event
      this.client.on('change_state', (state) => {
        console.log('CHANGE STATE', state);
        this.emit('change_state', state);
      });

      // Call event
      this.client.on('call', async (call) => {
        console.log('Call received', call);
        this.emit('call', call);
      });

      await this.client.initialize();
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      this._isInitialized = false;
      this.emit('error', error);
    }
  }

  private async getOrCreateConversation(phone: string): Promise<Conversation> {
    // Check if conversation exists
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0] as Conversation;
    }
    
    // Create new conversation
    const newConversation: Omit<Conversation, 'id'> = {
      user_id: phone, // Using phone as user_id for simplicity
      user_phone: phone,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_bot_active: true
    };
    
    const { data, error } = await supabase
      .from('conversations')
      .insert([newConversation])
      .select();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  }

  private async updateConversationLastMessage(conversationId: string, message: string) {
    await supabase
      .from('conversations')
      .update({
        last_message: message,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
  }

  private async processWithAI(message: ChatMessage, conversation: Conversation) {
    try {
      // Skip processing if the message is from the bot itself to avoid loops
      if (message.sender_type === 'bot') {
        return;
      }
      
      // This is where you would integrate with your AI model
      // For now, we'll just send a simple reply
      const aiResponse = `This is an automated response to: "${message.content}"`;
      
      await this.sendMessage(conversation.user_phone, aiResponse, conversation.id);
    } catch (error) {
      console.error('Error processing message with AI:', error);
    }
  }

  public async sendMessage(to: string, content: string, conversationId: string) {
    if (!this.client || !this._isInitialized) {
      // Try to initialize if not already initialized
      try {
        console.log('WhatsApp client not initialized, attempting to initialize...');
        await this.initialize();
        
        // If initialization didn't succeed, throw error
        if (!this.client || !this._isInitialized) {
          throw new Error('WhatsApp client initialization failed');
        }
      } catch (error) {
        console.error('Error initializing WhatsApp client:', error);
        throw new Error('WhatsApp client not initialized and auto-initialization failed');
      }
    }
    
    try {
      // Format phone number if needed
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      
      // Send message via WhatsApp
      await this.client.sendMessage(formattedNumber, content);
      
      // Save message to database
      const messageData: Omit<ChatMessage, 'id'> = {
        conversation_id: conversationId,
        sender_id: 'bot', // This could be the bot ID or admin ID
        sender_type: 'bot',
        content,
        timestamp: new Date().toISOString(),
        is_read: true
      };
      
      const savedMessage = await createMessage(messageData);
      
      // Update conversation
      await this.updateConversationLastMessage(conversationId, content);
      
      return savedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async adminTakeOver(conversationId: string, adminId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        is_bot_active: false,
        assigned_admin_id: adminId,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select();
    
    if (error) {
      console.error('Error in admin takeover:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  }

  public async adminSendMessage(to: string, content: string, conversationId: string, adminId: string) {
    if (!this.client || !this._isInitialized) {
      // Try to initialize if not already initialized
      try {
        console.log('WhatsApp client not initialized, attempting to initialize...');
        await this.initialize();
        
        // If initialization didn't succeed, throw error
        if (!this.client || !this._isInitialized) {
          throw new Error('WhatsApp client initialization failed');
        }
      } catch (error) {
        console.error('Error initializing WhatsApp client:', error);
        throw new Error('WhatsApp client not initialized and auto-initialization failed');
      }
    }
    
    try {
      // Format phone number if needed
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      
      // Send message via WhatsApp
      await this.client.sendMessage(formattedNumber, content);
      
      // Save message to database
      const messageData: Omit<ChatMessage, 'id'> = {
        conversation_id: conversationId,
        sender_id: adminId,
        sender_type: 'admin',
        content,
        timestamp: new Date().toISOString(),
        is_read: true
      };
      
      const savedMessage = await createMessage(messageData);
      
      // Update conversation
      await this.updateConversationLastMessage(conversationId, content);
      
      return savedMessage;
    } catch (error) {
      console.error('Error sending admin message:', error);
      throw error;
    }
  }

  public async botTakeOver(conversationId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        is_bot_active: true,
        assigned_admin_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select();
    
    if (error) {
      console.error('Error in bot takeover:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public hasClient(): boolean {
    return !!this.client;
  }

  public getStatus() {
    return {
      status: this.client ? (this._isInitialized ? 'connected' : 'initializing') : 'disconnected',
      qrCode: this.qrCode
    };
  }

  public async getClientInfo() {
    if (!this.client || !this._isInitialized) {
      throw new Error('WhatsApp client not initialized');
    }
    
    try {
      const info = this.client.info;
      
      // Check if info is available
      if (!info) {
        return {
          status: 'initializing',
          message: 'Client info not available yet'
        };
      }
      
      return {
        pushname: info.pushname,
        wid: info.wid?.user,
        platform: info.platform
      };
    } catch (error) {
      console.error('Error getting client info:', error);
      return {
        status: 'error',
        message: 'Failed to get client info'
      };
    }
  }

  public async logout() {
    if (this.client && this._isInitialized) {
      await this.client.logout();
      this._isInitialized = false;
    }
  }
}

export default WhatsAppService;
