import { BaseWidgetProps } from '@autorestock/shared';

// User Service API Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  forwardingEmail?: string;
  tenantId?: string;
  isCompany?: boolean;
  companyName?: string;
  companyType?: string;
  companyRegistrationNumber?: string;
  isVatRegistered?: boolean;
  vatNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  tenantName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  forwardingEmail?: string;
  isCompany?: boolean;
  companyType?: string;
  companyRegistrationNumber?: string;
  isVatRegistered?: boolean;
  vatNumber?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  forwardingEmail?: string;
}

export interface EmailAlias {
  id: string;
  tenantId: string;
  alias: string;
  isActive: boolean;
  createdAt: string;
  forwardTo?: string;
  needsVerification?: boolean;
  verificationEmailSent?: boolean;
  cloudflareRuleCreated?: boolean;
}

export interface CreateAliasRequest {
  tenantId: string;
  alias: string;
  forwardTo?: string;
  service?: string;
}

export interface OnboardingStatus {
  userId: string;
  steps: {
    userRegistered: boolean;
    forwardingEmailSet: boolean;
    aliasCreated: boolean;
  };
  isComplete: boolean;
  completedAt?: string;
}

// Widget Props
export interface UserRegisterProps extends BaseWidgetProps {
  onUserCreated?: (user: User) => void;
}

export interface ForwardingEmailSettingsProps extends BaseWidgetProps {
  userId: string;
  user?: User;
  onEmailUpdated?: (user: User) => void;
}

export interface AliasCreatorProps extends BaseWidgetProps {
  tenantId: string;
  userId: string;
  user?: User;
  onAliasCreated?: (alias: EmailAlias) => void;
}

export interface OnboardingStatusProps extends BaseWidgetProps {
  userId: string;
  pollingInterval?: number;
  onStatusChange?: (status: OnboardingStatus) => void;
}

// Hook Types
export interface UseUserApiConfig {
  apiBase: string;
  authToken?: string;
}

export interface UseUserApiReturn {
  // User operations
  createUser: (data: CreateUserRequest) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  updateUser: (userId: string, data: UpdateUserRequest) => Promise<User>;
  
  // Alias operations
  createAlias: (data: CreateAliasRequest) => Promise<EmailAlias>;
  getAliases: (tenantId: string) => Promise<EmailAlias[]>;
  
  // Onboarding operations
  getOnboardingStatus: (userId: string) => Promise<OnboardingStatus>;
  
  // State
  loading: boolean;
  error: string | null;
}
