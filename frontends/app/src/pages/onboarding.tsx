/**
 * Onboarding Page
 * Complete onboarding flow for new users
 */

import React from 'react';
import Head from 'next/head';
import { UserRegister } from '@autorestock/ui-user';

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Getting Started - AutoRestock</title>
        <meta name="description" content="Set up your AutoRestock account in just a few steps" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Get Started with AutoRestock
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Complete your setup in just a few steps
            </p>
          </div>
          <UserRegister />
        </div>
      </div>
    </>
  );
}

