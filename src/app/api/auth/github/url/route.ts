import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GITHUB_CLIENT_ID not configured' }, { status: 500 });
  }

  // Use APP_URL if available, otherwise fallback to origin from request headers
  const origin = process.env.APP_URL || new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo user',
    state: Math.random().toString(36).substring(7),
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ url: authUrl });
}
