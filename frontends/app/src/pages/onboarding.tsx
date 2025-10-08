/**
 * Onboarding Page
 * Complete onboarding flow for new users
 */

import React from 'react';
import Head from 'next/head';
import OnboardingWizard from '@autorestock/ui-user/src/components/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Getting Started - AutoRestock</title>
        <meta name="description" content="Set up your AutoRestock account in just a few steps" />
      </Head>
      
      <OnboardingWizard />
    </>
  );
}

