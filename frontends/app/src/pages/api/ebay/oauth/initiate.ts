/**
 * eBay OAuth Initiate
 * Starts the eBay OAuth flow
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { redirectUri, scopes = ['https://api.ebay.com/oauth/api_scope/sell.account'] } = req.body;

    if (!redirectUri) {
      return res.status(400).json({ error: 'Redirect URI is required' });
    }

    // Generate state parameter for security
    const state = crypto.randomBytes(32).toString('hex');
    
    // eBay OAuth configuration
    const clientId = process.env.EBAY_CLIENT_ID;
    const baseUrl = process.env.EBAY_BASE_URL || 'https://auth.ebay.com';
    
    if (!clientId) {
      return res.status(500).json({ error: 'eBay client ID not configured' });
    }

    // Build OAuth URL
    const authUrl = new URL('/oauth2/authorize', baseUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('state', state);

    // Store state in session or database for verification
    // In a real implementation, you'd store this in a database or session
    // For now, we'll return it to be stored client-side
    
    res.json({
      success: true,
      authUrl: authUrl.toString(),
      state
    });

  } catch (error) {
    console.error('eBay OAuth initiate error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate eBay OAuth',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
