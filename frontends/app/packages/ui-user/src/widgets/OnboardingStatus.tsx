import React, { useState, useEffect, useRef } from 'react';
import { Card, Alert, Loading, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { OnboardingStatusProps, OnboardingStatus as OnboardingStatusType } from '../types';

export const OnboardingStatus: React.FC<OnboardingStatusProps> = ({
  apiBase,
  authToken,
  userId,
  pollingInterval = 5000,
  onStatusChange,
  themeOverrides,
}) => {
  const [status, setStatus] = useState<OnboardingStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getOnboardingStatus } = useUserApi({ apiBase, authToken });

  const fetchStatus = async () => {
    try {
      const onboardingStatus = await getOnboardingStatus(userId);
      setStatus(onboardingStatus);
      setError(null);
      onStatusChange?.(onboardingStatus);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch onboarding status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchStatus();

    // Set up polling if not complete
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStatus();
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, pollingInterval]);

  // Stop polling when onboarding is complete
  useEffect(() => {
    if (status?.isComplete && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status?.isComplete]);

  const getStepStatus = (stepName: string, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
          <span>✓</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{stepName}</span>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
        <span>○</span>
        <span>{stepName}</span>
      </div>
    );
  };

  const getProgressPercentage = (): number => {
    if (!status) return 0;
    
    const completedSteps = Object.values(status.steps).filter(Boolean).length;
    const totalSteps = Object.keys(status.steps).length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (loading && !status) {
    return (
      <Card title="Onboarding Status">
        <Loading text="Loading onboarding status..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Onboarding Status">
        <Alert variant="error">
          {error}
        </Alert>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card title="Onboarding Status">
        <Alert variant="warning">
          No onboarding status found for user {userId}
        </Alert>
      </Card>
    );
  }

  return (
    <Card title="Onboarding Status">
      <Stack spacing="md">
        {status.isComplete ? (
          <Alert variant="success">
            <strong>🎉 Onboarding Complete!</strong>
            <br />
            All setup steps have been completed successfully.
            {status.completedAt && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Completed on: {new Date(status.completedAt).toLocaleDateString()}
              </div>
            )}
          </Alert>
        ) : (
          <Alert variant="info">
            <strong>Setup Progress: {getProgressPercentage()}%</strong>
            <br />
            Complete the remaining steps to finish your setup.
            {pollingInterval > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Status updates automatically every {pollingInterval / 1000} seconds
              </div>
            )}
          </Alert>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            Setup Steps:
          </h4>
          
          <Stack spacing="sm">
            {getStepStatus('User Account Created', status.steps.userRegistered)}
            {getStepStatus('Forwarding Email Configured', status.steps.forwardingEmailSet)}
            {getStepStatus('Email Alias Created', status.steps.aliasCreated)}
          </Stack>
        </div>

        {!status.isComplete && pollingInterval > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#6b7280',
            marginTop: '1rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#0ea5e9',
              animation: 'pulse 2s infinite'
            }} />
            Live updates enabled
          </div>
        )}
      </Stack>
    </Card>
  );
};
