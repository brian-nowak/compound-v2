import { NextRequest, NextResponse } from 'next/server';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Calling Go backend at:', `${GO_BACKEND_URL}/api/link-token`);
    console.log('Request body:', body);

    const response = await fetch(`${GO_BACKEND_URL}/api/link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Go backend response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Go backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('Go backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting link token:', error);
    return NextResponse.json({
      error: 'Failed to get link token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
