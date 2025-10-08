/**
 * EmailIngestionConfig.ts
 * TypeScript interface for email ingestion configuration
 */

export interface EmailIngestionConfig {
  enabled: boolean;
  provider: 'gmail' | 'privateemail' | 'other';
  imapHost: string;
  imapPort: number;
  secure: boolean;
  username: string;
  appPassword: string;
  mailbox: string;
  allowedSenders: string[];
  gdprConsent: boolean;
  consentTs: string; // ISO
}

export const DEFAULT_EMAIL_INGESTION_CONFIG: Partial<EmailIngestionConfig> = {
  enabled: false,
  provider: 'gmail',
  imapHost: 'imap.gmail.com',
  imapPort: 993,
  secure: true,
  mailbox: 'INBOX',
  allowedSenders: ['*@ebay.co.uk', '*@ebay.com', '*@vinted.co.uk', '*@vinted.com'],
  appPassword: '',
  username: '',
  gdprConsent: false,
  consentTs: ''
};

export const PROVIDER_CONFIGS = {
  gmail: {
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    secure: true
  },
  privateemail: {
    imapHost: 'mail.privateemail.com',
    imapPort: 993,
    secure: true
  },
  other: {
    imapHost: '',
    imapPort: 993,
    secure: true
  }
} as const;
