// src/app/api/python-proxy/route.ts
import { type NextRequest, NextResponse } from 'next/server';

// Ensure PYTHON_SERVICE_URL is set in your .env file
const PYTHON_SERVICE_BASE_URL = process.env.PYTHON_SERVICE_URL;

if (!PYTHON_SERVICE_BASE_URL) {
  console.error("PYTHON_SERVICE_URL environment variable is not set.");
}

export async function POST(request: NextRequest) {
  if (!PYTHON_SERVICE_BASE_URL) {
    return NextResponse.json(
      { message: 'Python service URL is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const requestBody = await request.json();
    const { __python_endpoint, ...actualBody } = requestBody;

    if (!__python_endpoint) {
      return NextResponse.json(
        { message: "Missing '__python_endpoint' in request body to proxy." },
        { status: 400 }
      );
    }
    
    const targetUrl = `${PYTHON_SERVICE_BASE_URL.replace(/\/$/, '')}${__python_endpoint}`;

    // Forward the request to the Python service
    const pythonResponse = await fetch(targetUrl, {
      method: 'POST', // Assuming all calls to Python service are POST for simplicity
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actualBody), // Send only the actual body, not the endpoint specifier
    });

    const responseText = await pythonResponse.text();

    if (!pythonResponse.ok) {
      let errorDetails = responseText;
      try {
        errorDetails = JSON.parse(responseText);
      } catch (e) { /* If not JSON, use raw text */ }
      console.error(`Error from Python service (${targetUrl}):`, pythonResponse.status, errorDetails);
      return NextResponse.json(
        { 
          message: `Error received from Python service endpoint: ${__python_endpoint}.`,
          statusCode: pythonResponse.status,
          details: errorDetails 
        },
        { status: pythonResponse.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`Failed to parse JSON response from Python service (${targetUrl}):`, e);
      return NextResponse.json(
        { message: `Received non-JSON response from Python service endpoint: ${__python_endpoint}.`, details: responseText },
        { status: 502 } // Bad Gateway
      );
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in Python proxy API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
       return NextResponse.json(
        { message: 'Could not connect to the Python service. Ensure it is running and accessible.', details: errorMessage },
        { status: 503 } // Service Unavailable
      );
    }
    return NextResponse.json(
      { message: 'Internal server error in proxy.', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!PYTHON_SERVICE_BASE_URL) {
    return NextResponse.json(
      { 
        status: 'misconfigured',
        message: 'Python Proxy API is misconfigured. PYTHON_SERVICE_URL is not set.' 
      }, 
      { status: 500 }
    );
  }
  // Check connectivity to the Python service's health endpoint
  try {
    const healthCheckUrl = `${PYTHON_SERVICE_BASE_URL.replace(/\/$/, '')}/`; // Assuming '/' is health check
    const pythonHealthResponse = await fetch(healthCheckUrl);
    const pythonHealthData = await pythonHealthResponse.json();
    return NextResponse.json({ 
      status: 'running',
      message: 'Python Proxy API is running. Use POST to send data to specific Python endpoints.',
      python_service_target_base_url: PYTHON_SERVICE_BASE_URL,
      python_service_health: pythonHealthData
    });
  } catch (e) {
    return NextResponse.json({ 
      status: 'partially_running',
      message: 'Python Proxy API is running, but could not connect to Python service health check.',
      python_service_target_base_url: PYTHON_SERVICE_BASE_URL,
      error: (e as Error).message
    }, {status: 503});
  }
}
