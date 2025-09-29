import { useState, useCallback } from 'react';
import { fetchClient } from '@autorestock/shared';
import { 
  UseUserApiConfig, 
  UseUserApiReturn, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  EmailAlias,
  CreateAliasRequest,
  OnboardingStatus
} from '../types';

export const useUserApi = (config: UseUserApiConfig): UseUserApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a configured fetch client
  const api = fetchClient;
  if (config.authToken) {
    api.setAuthToken(config.authToken);
  }
  api.updateConfig({ baseURL: config.apiBase });

  const handleError = useCallback((err: any) => {
    const errorMessage = err?.message || 'An unexpected error occurred';
    setError(errorMessage);
    throw err;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createUser = useCallback(async (data: CreateUserRequest): Promise<User> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  const getUser = useCallback(async (userId: string): Promise<User> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  const updateUser = useCallback(async (userId: string, data: UpdateUserRequest): Promise<User> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.put<User>(`/users/${userId}`, data);
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  const createAlias = useCallback(async (data: CreateAliasRequest): Promise<EmailAlias> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.post<EmailAlias>(`/tenants/${data.tenantId}/aliases`, {
        alias: data.alias
      });
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  const getAliases = useCallback(async (tenantId: string): Promise<EmailAlias[]> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.get<EmailAlias[]>(`/tenants/${tenantId}/aliases`);
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  const getOnboardingStatus = useCallback(async (userId: string): Promise<OnboardingStatus> => {
    setLoading(true);
    clearError();
    
    try {
      const response = await api.get<OnboardingStatus>(`/onboarding/status`, {
        params: { userId }
      });
      return response.data;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [api, handleError, clearError]);

  return {
    createUser,
    getUser,
    updateUser,
    createAlias,
    getAliases,
    getOnboardingStatus,
    loading,
    error,
  };
};
