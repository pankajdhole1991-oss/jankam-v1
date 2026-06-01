// ============================================================
// whatsappArchitecture.ts — Future WhatsApp Integration Desk
// Architecture contract preparation ONLY. Do not execute or import.
// ============================================================

import { type Language } from '../data/knowledgeBase';
import { type ChatMessage, type ConversationContext } from '../utils/aiEngine';

/**
 * ── WHATSAPP WEBHOOK PAYLOAD CONTRACT ──
 * Describes the incoming JSON structure from the Meta Graph API / WhatsApp Business API
 */
export interface WhatsAppIncomingPayload {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: Array<{
          profile: {
            name: string;
          };
          wa_id: string; // Worker's WhatsApp ID (phone number)
        }>;
        messages: Array<{
          id: string;
          from: string; // Sender's phone number
          timestamp: string;
          type: 'text' | 'interactive' | 'document' | 'image';
          text?: {
            body: string;
          };
          interactive?: {
            type: 'button_reply' | 'list_reply';
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
              description?: string;
            };
          };
        }>;
      };
      field: 'messages';
    }>;
  }>;
}

/**
 * ── OUTGOING MESSAGE SCHEMAS ──
 * Descriptions of supported outgoing formats for WhatsApp
 */
export interface WhatsAppOutgoingMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string; // Recipient phone number
  type: 'text' | 'interactive';
  text?: {
    preview_url?: boolean;
    body: string; // Supports markdown bold (*bold*), italic (_italic_), strikethrough (~strike~), and monospace (```code```)
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
    };
  };
}

/**
 * ── EMERGENCY DIRECTORY SCHEMA ──
 * Directory details to share with workers in critical situations
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  category: 'police' | 'women_helpline' | 'labour_office' | 'medical';
  description: string;
}

export const EMERGENCY_DIRECTORY: Record<Language, EmergencyContact[]> = {
  en: [
    { name: 'Maharashtra Police Emergency', phone: '112', category: 'police', description: 'Immediate safety and security dispatch' },
    { name: 'Women Helpline', phone: '1091', category: 'women_helpline', description: '24/7 dedicated domestic safety & support' },
    { name: 'JanKam Free Labour Helpline', phone: '1800-123-4567', category: 'labour_office', description: 'Free legal guidance & dispute counseling' },
  ],
  hi: [
    { name: 'महाराष्ट्र पुलिस आपातकालीन', phone: '112', category: 'police', description: 'तत्काल सुरक्षा सहायता' },
    { name: 'महिला हेल्पलाइन', phone: '1091', category: 'women_helpline', description: '24/7 महिला सुरक्षा और सहायता' },
  ],
  mr: [
    { name: 'महाराष्ट्र पोलीस आणीबाणी', phone: '112', category: 'police', description: 'त्वरित पोलीस मदत' },
    { name: 'महिला हेल्पलाइन', phone: '1091', category: 'women_helpline', description: '२४/७ महिला सुरक्षा व मार्गदर्शन' },
  ],
};

/**
 * ── WHATSAPP ARCHITECTURE INTEGRATION LAYER ──
 * Blueprint for the future WhatsApp Labour Assistant router
 */
export class WhatsAppLabourAssistantRouter {
  
  /**
   * Router entry point to handle incoming webhook requests
   */
  public async handleIncomingWebhook(payload: WhatsAppIncomingPayload): Promise<WhatsAppOutgoingMessage[]> {
    const changes = payload.entry?.[0]?.changes?.[0]?.value;
    if (!changes || !changes.messages || changes.messages.length === 0) {
      return [];
    }

    const message = changes.messages[0];
    const workerPhone = message.from;
    const workerName = changes.contacts?.[0]?.profile?.name || 'Worker';
    
    // 1. Resolve raw text content
    let rawText = '';
    if (message.type === 'text' && message.text) {
      rawText = message.text.body;
    } else if (message.type === 'interactive' && message.interactive) {
      const interactive = message.interactive;
      rawText = interactive.button_reply?.title || interactive.list_reply?.title || '';
    }

    if (!rawText.trim()) return [];

    // 2. Fetch or initialize worker's session context from Database Cache
    const sessionContext = await this.getWorkerSessionContext(workerPhone);

    // 3. Detect Emergency triggers and auto-route
    if (this.isEmergencyTrigger(rawText)) {
      return [this.generateEmergencyResponse(workerPhone, sessionContext.language)];
    }

    // 4. Invoke JanKam Labour Assistant AI Engine (modular import)
    // Blueprinted call to generateResponse(rawText, 'sahayak', sessionContext)
    const mockAIResponse = {
      content: `*JanKam Labour Assistant*\n\nHello *${workerName}*, I have received your request regarding: "${rawText}".\n\nUnder Maharashtra Labour laws, you are fully protected.`,
      followUps: ['Check PF status', 'File complaint', 'Speak with counselor']
    };

    // 5. Update and persist worker session memory context
    await this.saveWorkerSessionContext(workerPhone, sessionContext);

    // 6. Generate outgoing payloads (with WhatsApp quick-reply buttons based on follow-ups)
    return [
      this.buildWhatsAppTextMessage(workerPhone, mockAIResponse.content, mockAIResponse.followUps)
    ];
  }

  // Mock methods representing database cache lookups for session-based memory
  private async getWorkerSessionContext(phone: string): Promise<ConversationContext> {
    return {
      messages: [],
      collectedData: { phone },
      language: 'en'
    };
  }

  private async saveWorkerSessionContext(phone: string, context: ConversationContext): Promise<void> {
    // Blueprint to store context in Redis / Supabase cache with a 24-hour TTL
  }

  private isEmergencyTrigger(text: string): boolean {
    const lower = text.toLowerCase();
    return ['emergency', 'police', 'threat', 'unsafe', 'help', 'danger', 'harass', 'मारहाण', 'खतरा', 'बचाओ'].some(t => lower.includes(t));
  }

  private generateEmergencyResponse(to: string, lang: Language): WhatsAppOutgoingMessage {
    const list = EMERGENCY_DIRECTORY[lang] || EMERGENCY_DIRECTORY.en;
    let bodyText = `⚠️ *JANKAM EMERGENCY RESPONSE* ⚠️\n\nWe detected a critical security or safety word. Please remain calm. Your safety is paramount.\n\n*Emergency Hotlines:*\n`;
    
    list.forEach(c => {
      bodyText += `- *${c.name}:* Call *${c.phone}* (${c.description})\n`;
    });
    
    bodyText += `\n*JanKam Legal Links:*\n- File a formal complaint: https://jankam.org#complaint\n- WhatsApp direct coordinator email: help@jankam.org`;

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: bodyText }
    };
  }

  private buildWhatsAppTextMessage(to: string, body: string, buttons?: string[]): WhatsAppOutgoingMessage {
    if (buttons && buttons.length > 0 && buttons.length <= 3) {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: body },
          action: {
            buttons: buttons.map((b, idx) => ({
              type: 'reply',
              reply: {
                id: `btn_followup_${idx}`,
                title: b.slice(0, 20) // WhatsApp buttons are capped at 20 characters
              }
            }))
          }
        }
      };
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body }
    };
  }
}
