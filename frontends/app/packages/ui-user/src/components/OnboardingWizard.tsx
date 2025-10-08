/**
 * OnboardingWizard.tsx
 * Complete onboarding flow for new users
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';

import { CheckCircle, ArrowRight, ArrowLeft, Mail, ShoppingCart, FileText, User, Settings } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component?: React.ComponentType<OnboardingStepProps>;
  completed: boolean;
}

interface OnboardingStepProps {
  onComplete: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  data: any;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AutoRestock',
    description: 'Let\'s get you set up in just a few steps',
    icon: <User className="w-6 h-6" />,
    component: WelcomeStep,
    completed: false
  },
  {
    id: 'ebay-oauth',
    title: 'Connect eBay Account',
    description: 'Link your eBay seller account for automatic data sync',
    icon: <ShoppingCart className="w-6 h-6" />,
    component: EbayOAuthStep,
    completed: false
  },
  {
    id: 'email-setup',
    title: 'Email Integration',
    description: 'Set up email aliases for automatic order processing',
    icon: <Mail className="w-6 h-6" />,
    component: EmailSetupStep,
    completed: false
  },
  {
    id: 'csv-import',
    title: 'Import Past Transactions',
    description: 'Upload your eBay transaction history',
    icon: <FileText className="w-6 h-6" />,
    completed: false
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your AutoRestock account is ready to use',
    icon: <CheckCircle className="w-6 h-6" />,
    component: CompleteStep,
    completed: false
  }
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStepConfig = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleComplete = (data: any) => {
    setStepData((prev: any) => ({ ...prev, ...data }));
    setCompletedSteps((prev: string[]) => [...prev, currentStepConfig.id]);
    
    // Mark step as completed
    steps[currentStep].completed = true;
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Getting Started</h1>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                index === currentStep
                  ? 'bg-blue-100 text-blue-700'
                  : completedSteps.includes(step.id)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {completedSteps.includes(step.id) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              {currentStepConfig.icon}
              <div>
                <h2 className="text-2xl font-bold">{currentStepConfig.title}</h2>
                <p className="text-gray-600 font-normal">{currentStepConfig.description}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {currentStepConfig.component && (
              <currentStepConfig.component
                onComplete={handleComplete}
                onNext={handleNext}
                onPrevious={handlePrevious}
                data={stepData}
              />
            )}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-3">
            {currentStep < steps.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-600"
              >
                Skip for now
              </Button>
            )}
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!completedSteps.includes(currentStepConfig.id)}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onComplete }: OnboardingStepProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    country: 'UK'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ userInfo: formData });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
        <p className="text-gray-600">
          Tell us about your business to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your business name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </div>
  );
}

// eBay OAuth Step Component
function EbayOAuthStep({ onComplete }: OnboardingStepProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleEbayConnect = async () => {
    setIsConnecting(true);
    
    try {
      // This would initiate the eBay OAuth flow
      const response = await fetch('/api/ebay/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri: window.location.origin + '/onboarding' })
      });
      
      const { authUrl } = await response.json();
      
      // Redirect to eBay OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('eBay OAuth error:', error);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Check if user is returning from eBay OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleEbayCallback(code, state);
    }
  }, []);

  const handleEbayCallback = async (code: string, state: string) => {
    try {
      const response = await fetch('/api/ebay/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      });
      
      const { success, ebayAccount } = await response.json();
      
      if (success) {
        setIsConnected(true);
        onComplete({ ebayAccount });
      }
    } catch (error) {
      console.error('eBay OAuth callback error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your eBay Account</h3>
        <p className="text-gray-600">
          Link your eBay seller account to automatically sync your listings and sales
        </p>
      </div>

      {isConnected ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-green-700 mb-2">eBay Account Connected!</h4>
          <p className="text-gray-600">
            Your eBay account has been successfully linked to AutoRestock.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic listing synchronization</li>
              <li>• Real-time sales notifications</li>
              <li>• Inventory tracking</li>
              <li>• Performance analytics</li>
            </ul>
          </div>

          <Button
            onClick={handleEbayConnect}
            disabled={isConnecting}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isConnecting ? 'Connecting...' : 'Connect eBay Account'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to eBay to authorize the connection
          </p>
        </div>
      )}
    </div>
  );
}

// Email Setup Step Component
function EmailSetupStep({ onComplete }: OnboardingStepProps) {
  const [emailAliases, setEmailAliases] = useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = useState(false);

  const addAlias = () => {
    setEmailAliases(prev => [...prev, '']);
  };

  const removeAlias = (index: number) => {
    setEmailAliases(prev => prev.filter((_, i) => i !== index));
  };

  const updateAlias = (index: number, value: string) => {
    setEmailAliases(prev => prev.map((alias, i) => i === index ? value : alias));
  };

  const generateAlias = async (index: number) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/email/generate-alias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'ebay' })
      });
      
      const { alias } = await response.json();
      updateAlias(index, alias);
    } catch (error) {
      console.error('Alias generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    const validAliases = emailAliases.filter(alias => alias.trim());
    onComplete({ emailAliases: validAliases });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Set Up Email Integration</h3>
        <p className="text-gray-600">
          Create email aliases to automatically process order emails from eBay and other platforms
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• We'll create unique email addresses for each platform</li>
            <li>• Forward these emails to your main email address</li>
            <li>• AutoRestock will extract order data automatically</li>
            <li>• No need to change your eBay settings</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Email Aliases:</h4>
          {emailAliases.map((alias, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={alias}
                onChange={(e) => updateAlias(index, e.target.value)}
                placeholder="ebay-orders@in.autorestock.app"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => generateAlias(index)}
                disabled={isGenerating}
                size="sm"
              >
                Generate
              </Button>
              {emailAliases.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeAlias(index)}
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addAlias}
            className="w-full"
          >
            + Add Another Alias
          </Button>
        </div>

        <Button onClick={handleComplete} className="w-full">
          Set Up Email Integration
        </Button>
      </div>
    </div>
  );
}

// CSV Import Step Component
function CsvImportStep({ onComplete }: OnboardingStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch('/api/import/ebay-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResults(result);
      onComplete({ csvImport: result });
    } catch (error) {
      console.error('CSV import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Import Past Transactions</h3>
        <p className="text-gray-600">
          Upload your eBay transaction history to get started with historical data
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">How to export from eBay:</h4>
          <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
            <li>Go to eBay Seller Hub</li>
            <li>Click on "Orders" → "Download orders"</li>
            <li>Select date range and download CSV</li>
            <li>Upload the file here</li>
          </ol>
        </div>

        {!importResults ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <FileText className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Upload CSV File</p>
                <p className="text-sm text-gray-500">Click to select or drag and drop</p>
              </div>
            </label>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Processing...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Import Complete!</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>• {importResults.totalTransactions} transactions imported</p>
              <p>• {importResults.successfulImports} successful</p>
              <p>• {importResults.failedImports} failed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Complete Step Component
function CompleteStep({ data }: OnboardingStepProps) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Welcome to AutoRestock!</h3>
      <p className="text-gray-600 mb-6">
        Your account is set up and ready to help you manage your reselling business.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h4 className="font-semibold mb-3">What's Next:</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Account created</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>eBay account connected</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Email integration active</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Past transactions imported</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

