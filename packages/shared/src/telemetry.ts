import { TelemetryEvent, TelemetryConfig } from './types';

export class Telemetry {
  private config: TelemetryConfig;
  private events: TelemetryEvent[] = [];
  private sessionId: string;

  constructor(config: TelemetryConfig = { enabled: false }) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    
    // Auto-track page visibility and session events
    if (typeof window !== 'undefined') {
      this.setupAutoTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupAutoTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility_change', {
        hidden: document.hidden,
        timestamp: new Date().toISOString(),
      });
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', {
        timestamp: new Date().toISOString(),
      });
    });
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.events.push(telemetryEvent);

    // Log in debug mode
    if (this.config.debug) {
      console.log('[Telemetry]', telemetryEvent);
    }

    // Send to endpoint if configured
    if (this.config.endpoint) {
      this.sendToEndpoint(telemetryEvent);
    }
  }

  private async sendToEndpoint(event: TelemetryEvent): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      await fetch(this.config.endpoint!, {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('[Telemetry] Failed to send event:', error);
      }
    }
  }

  // Convenience methods for common events
  trackMounted(component: string, properties?: Record<string, any>): void {
    this.track('component_mounted', {
      component,
      ...properties,
    });
  }

  trackSubmit(form: string, properties?: Record<string, any>): void {
    this.track('form_submit', {
      form,
      ...properties,
    });
  }

  trackSuccess(action: string, properties?: Record<string, any>): void {
    this.track('action_success', {
      action,
      ...properties,
    });
  }

  trackError(action: string, error: string, properties?: Record<string, any>): void {
    this.track('action_error', {
      action,
      error,
      ...properties,
    });
  }

  trackNavigation(from: string, to: string, properties?: Record<string, any>): void {
    this.track('navigation', {
      from,
      to,
      ...properties,
    });
  }

  trackApiCall(method: string, endpoint: string, status: number, duration?: number): void {
    this.track('api_call', {
      method,
      endpoint,
      status,
      duration,
      success: status >= 200 && status < 400,
    });
  }

  // Session management
  setUserId(userId: string): void {
    this.track('user_identified', { userId });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Event retrieval for debugging
  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  // Configuration updates
  updateConfig(updates: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }
}

// Default instance
export const telemetry = new Telemetry();
