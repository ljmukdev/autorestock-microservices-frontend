/**
 * eBay OAuth Callback
 * Handles the callback from eBay OAuth
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: 'Code and state are required' });
    }

    // Verify state parameter (should match what was sent in initiate)
    // In a real implementation, you'd verify this against stored state
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: req.body.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Get user account information
    const userResponse = await fetch('https://api.ebay.com/commerce/identity/v1/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    const userData = await userResponse.json();

    // Store the tokens and account info in your database
    // This would typically involve:
    // 1. Creating or updating a user record
    // 2. Storing the access token securely
    // 3. Setting up refresh token handling
    
    const ebayAccount = {
      id: userData.userId || 'unknown',
      username: userData.username || 'unknown',
      email: userData.email || 'unknown',
      storeName: userData.storeName,
      accountType: userData.accountType || 'individual',
      verified: userData.verified || false,
      connectedAt: new Date().toISOString(),
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
    };

    // In a real implementation, save this to your database
    // await saveEbayAccount(req.user.id, ebayAccount);

    res.json({
      success: true,
      account: {
        id: ebayAccount.id,
        username: ebayAccount.username,
        email: ebayAccount.email,
        storeName: ebayAccount.storeName,
        accountType: ebayAccount.accountType,
        verified: ebayAccount.verified,
        connectedAt: ebayAccount.connectedAt
      }
    });

  } catch (error) {
    console.error('eBay OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Failed to process eBay OAuth callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

