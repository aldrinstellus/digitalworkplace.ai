// CRM Integration Adapter for Chat Core IQ Chatbot
// Supports Salesforce and Microsoft Dynamics 365
// ITN 2025-20 Section 3.1.2 (Optional)

export type CRMProvider = 'salesforce' | 'dynamics' | 'none';

export interface CRMConfig {
  provider: CRMProvider;
  enabled: boolean;
  // Salesforce
  salesforce?: {
    instanceUrl: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    securityToken: string;
  };
  // Microsoft Dynamics 365
  dynamics?: {
    organizationUrl: string;
    clientId: string;
    clientSecret: string;
    tenantId: string;
  };
}

export interface CRMContact {
  id?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  channel?: string;
}

export interface CRMCase {
  id?: string;
  contactId?: string;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: string;
  language: string;
  sentiment?: string;
  conversationId?: string;
  createdAt: string;
}

export interface CRMConversation {
  sessionId: string;
  contactId?: string;
  caseId?: string;
  channel: string;
  language: string;
  sentiment: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  escalated: boolean;
  startTime: string;
  endTime?: string;
}

// Salesforce REST API Client
class SalesforceClient {
  private config: CRMConfig['salesforce'];
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor(config: CRMConfig['salesforce']) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    if (!this.config) return false;

    try {
      // OAuth 2.0 Password Grant Flow
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: `${this.config.password}${this.config.securityToken}`,
      });

      const response = await fetch(`${this.config.instanceUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error('[Salesforce] Authentication failed:', response.status);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.instanceUrl = data.instance_url;
      return true;
    } catch (error) {
      console.error('[Salesforce] Authentication error:', error);
      return false;
    }
  }

  async createContact(contact: CRMContact): Promise<string | null> {
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }
    if (!this.accessToken) return null;

    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v58.0/sobjects/Contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: contact.firstName || 'Chat',
          LastName: contact.lastName || 'User',
          Email: contact.email,
          Phone: contact.phone,
          Description: `Channel: ${contact.channel}, Language: ${contact.language}`,
        }),
      });

      if (!response.ok) {
        console.error('[Salesforce] Create contact failed:', response.status);
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('[Salesforce] Create contact error:', error);
      return null;
    }
  }

  async createCase(caseData: CRMCase): Promise<string | null> {
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }
    if (!this.accessToken) return null;

    try {
      const priorityMap = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'High' };
      const response = await fetch(`${this.instanceUrl}/services/data/v58.0/sobjects/Case`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ContactId: caseData.contactId,
          Subject: caseData.subject,
          Description: caseData.description,
          Status: 'New',
          Priority: priorityMap[caseData.priority],
          Origin: `Chatbot - ${caseData.channel}`,
          Type: 'Inquiry',
          Chatbot_Conversation_ID__c: caseData.conversationId,
          Chatbot_Sentiment__c: caseData.sentiment,
          Chatbot_Language__c: caseData.language,
        }),
      });

      if (!response.ok) {
        console.error('[Salesforce] Create case failed:', response.status);
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('[Salesforce] Create case error:', error);
      return null;
    }
  }

  async logConversation(conversation: CRMConversation): Promise<boolean> {
    // Log conversation as a Task or Custom Object
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v58.0/sobjects/Task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Subject: `Chatbot Conversation - ${conversation.sessionId}`,
          Description: conversation.messages.map(m => `[${m.role}]: ${m.content}`).join('\n'),
          Status: 'Completed',
          Priority: conversation.escalated ? 'High' : 'Normal',
          WhatId: conversation.caseId,
          WhoId: conversation.contactId,
          ActivityDate: conversation.endTime || conversation.startTime,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[Salesforce] Log conversation error:', error);
      return false;
    }
  }
}

// Microsoft Dynamics 365 Client
class DynamicsClient {
  private config: CRMConfig['dynamics'];
  private accessToken: string | null = null;

  constructor(config: CRMConfig['dynamics']) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    if (!this.config) return false;

    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: `${this.config.organizationUrl}/.default`,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error('[Dynamics] Authentication failed:', response.status);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('[Dynamics] Authentication error:', error);
      return false;
    }
  }

  async createContact(contact: CRMContact): Promise<string | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }
    if (!this.accessToken || !this.config) return null;

    try {
      const response = await fetch(`${this.config.organizationUrl}/api/data/v9.2/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify({
          firstname: contact.firstName || 'Chat',
          lastname: contact.lastName || 'User',
          emailaddress1: contact.email,
          telephone1: contact.phone,
          description: `Channel: ${contact.channel}, Language: ${contact.language}`,
        }),
      });

      if (!response.ok) {
        console.error('[Dynamics] Create contact failed:', response.status);
        return null;
      }

      // Dynamics returns the ID in the OData-EntityId header
      const entityId = response.headers.get('OData-EntityId');
      if (entityId) {
        const match = entityId.match(/\(([^)]+)\)/);
        return match ? match[1] : null;
      }
      return null;
    } catch (error) {
      console.error('[Dynamics] Create contact error:', error);
      return null;
    }
  }

  async createCase(caseData: CRMCase): Promise<string | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }
    if (!this.accessToken || !this.config) return null;

    try {
      const priorityMap = { low: 3, medium: 2, high: 1, urgent: 1 };
      const response = await fetch(`${this.config.organizationUrl}/api/data/v9.2/incidents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify({
          title: caseData.subject,
          description: caseData.description,
          prioritycode: priorityMap[caseData.priority],
          caseorigincode: 3, // Web
          'customerid_contact@odata.bind': caseData.contactId
            ? `/contacts(${caseData.contactId})`
            : undefined,
          new_chatbot_conversation_id: caseData.conversationId,
          new_chatbot_sentiment: caseData.sentiment,
          new_chatbot_language: caseData.language,
          new_chatbot_channel: caseData.channel,
        }),
      });

      if (!response.ok) {
        console.error('[Dynamics] Create case failed:', response.status);
        return null;
      }

      const entityId = response.headers.get('OData-EntityId');
      if (entityId) {
        const match = entityId.match(/\(([^)]+)\)/);
        return match ? match[1] : null;
      }
      return null;
    } catch (error) {
      console.error('[Dynamics] Create case error:', error);
      return null;
    }
  }

  async logConversation(conversation: CRMConversation): Promise<boolean> {
    if (!this.accessToken) {
      await this.authenticate();
    }
    if (!this.accessToken || !this.config) return false;

    try {
      // Create a Phone Call activity to log the conversation
      const response = await fetch(`${this.config.organizationUrl}/api/data/v9.2/phonecalls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify({
          subject: `Chatbot Conversation - ${conversation.sessionId}`,
          description: conversation.messages.map(m => `[${m.role}]: ${m.content}`).join('\n'),
          directioncode: true, // Outgoing
          prioritycode: conversation.escalated ? 1 : 2,
          'regardingobjectid_incident@odata.bind': conversation.caseId
            ? `/incidents(${conversation.caseId})`
            : undefined,
          actualstart: conversation.startTime,
          actualend: conversation.endTime || new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[Dynamics] Log conversation error:', error);
      return false;
    }
  }
}

// Unified CRM Adapter
export class CRMAdapter {
  private config: CRMConfig;
  private salesforceClient: SalesforceClient | null = null;
  private dynamicsClient: DynamicsClient | null = null;

  constructor(config: CRMConfig) {
    this.config = config;

    if (config.provider === 'salesforce' && config.salesforce) {
      this.salesforceClient = new SalesforceClient(config.salesforce);
    } else if (config.provider === 'dynamics' && config.dynamics) {
      this.dynamicsClient = new DynamicsClient(config.dynamics);
    }
  }

  isEnabled(): boolean {
    return this.config.enabled && this.config.provider !== 'none';
  }

  async createContact(contact: CRMContact): Promise<string | null> {
    if (!this.isEnabled()) return null;

    if (this.salesforceClient) {
      return this.salesforceClient.createContact(contact);
    } else if (this.dynamicsClient) {
      return this.dynamicsClient.createContact(contact);
    }
    return null;
  }

  async createCase(caseData: CRMCase): Promise<string | null> {
    if (!this.isEnabled()) return null;

    if (this.salesforceClient) {
      return this.salesforceClient.createCase(caseData);
    } else if (this.dynamicsClient) {
      return this.dynamicsClient.createCase(caseData);
    }
    return null;
  }

  async logConversation(conversation: CRMConversation): Promise<boolean> {
    if (!this.isEnabled()) return false;

    if (this.salesforceClient) {
      return this.salesforceClient.logConversation(conversation);
    } else if (this.dynamicsClient) {
      return this.dynamicsClient.logConversation(conversation);
    }
    return false;
  }

  async syncEscalatedConversation(
    conversation: CRMConversation,
    userInfo?: { email?: string; phone?: string; name?: string }
  ): Promise<{ contactId?: string; caseId?: string }> {
    if (!this.isEnabled()) return {};

    const result: { contactId?: string; caseId?: string } = {};

    // Create or find contact
    if (userInfo?.email || userInfo?.phone) {
      const contactId = await this.createContact({
        email: userInfo.email,
        phone: userInfo.phone,
        firstName: userInfo.name?.split(' ')[0],
        lastName: userInfo.name?.split(' ').slice(1).join(' ') || 'User',
        language: conversation.language,
        channel: conversation.channel,
      });
      if (contactId) {
        result.contactId = contactId;
        conversation.contactId = contactId;
      }
    }

    // Create case for escalated conversation
    if (conversation.escalated) {
      const lastUserMessage = conversation.messages
        .filter(m => m.role === 'user')
        .pop()?.content || 'Customer inquiry';

      const caseId = await this.createCase({
        contactId: result.contactId,
        subject: `Escalated Chat: ${lastUserMessage.substring(0, 50)}...`,
        description: conversation.messages.map(m => `[${m.role}]: ${m.content}`).join('\n'),
        status: 'new',
        priority: conversation.sentiment === 'urgent' ? 'urgent' : 'high',
        channel: conversation.channel,
        language: conversation.language,
        sentiment: conversation.sentiment,
        conversationId: conversation.sessionId,
        createdAt: conversation.startTime,
      });

      if (caseId) {
        result.caseId = caseId;
        conversation.caseId = caseId;
      }
    }

    // Log the full conversation
    await this.logConversation(conversation);

    return result;
  }
}

// Factory function to create CRM adapter from environment variables
export function createCRMAdapter(): CRMAdapter {
  const provider = (process.env.CRM_PROVIDER as CRMProvider) || 'none';
  const enabled = process.env.CRM_ENABLED === 'true';

  const config: CRMConfig = {
    provider,
    enabled,
  };

  if (provider === 'salesforce') {
    config.salesforce = {
      instanceUrl: process.env.SALESFORCE_INSTANCE_URL || '',
      clientId: process.env.SALESFORCE_CLIENT_ID || '',
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
      username: process.env.SALESFORCE_USERNAME || '',
      password: process.env.SALESFORCE_PASSWORD || '',
      securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
    };
  } else if (provider === 'dynamics') {
    config.dynamics = {
      organizationUrl: process.env.DYNAMICS_ORGANIZATION_URL || '',
      clientId: process.env.DYNAMICS_CLIENT_ID || '',
      clientSecret: process.env.DYNAMICS_CLIENT_SECRET || '',
      tenantId: process.env.DYNAMICS_TENANT_ID || '',
    };
  }

  return new CRMAdapter(config);
}

// Export singleton for app-wide use
let crmAdapterInstance: CRMAdapter | null = null;

export function getCRMAdapter(): CRMAdapter {
  if (!crmAdapterInstance) {
    crmAdapterInstance = createCRMAdapter();
  }
  return crmAdapterInstance;
}
