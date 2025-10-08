'use client'

import { OnboardingWizard } from '@autorestock/ui-user'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AutoRestock</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="/users/onboarding" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                User Onboarding
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Onboarding</h1>
          <p className="text-lg text-gray-600">
            Complete your AutoRestock setup with these essential steps
          </p>
        </div>

        <OnboardingWizard />
      </div>
    </div>
  )
}