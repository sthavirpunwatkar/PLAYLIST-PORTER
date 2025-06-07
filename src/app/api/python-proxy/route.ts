// src/app/api/python-proxy/route.ts
import { type NextRequest, NextResponse } from 'next/server';

// Ensure PYTHON_SERVICE_URL is set in your .env file
// Example: PYTHON_SERVICE_URL=http://localhost:5001/process
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

if (!PYTHON_SERVICE_URL) {
  console.error("PYTHON_SERVICE_URL environment variable is not set.");
  // Optional: throw an error during build/startup if critical
  // throw new Error("PYTHON_SERVICE_URL environment variable is not set.");
}

export async function POST(request: NextRequest) {
  if (!PYTHON_SERVICE_URL) {
    return NextResponse.json(
      { message: 'Python service URL is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Forward the request to the Python service
    const pythonResponse = await fetch(PYTHON_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers your Python service might expect
      },
      body: JSON.stringify(body),
    });

    // Read the response body as text first to handle non-JSON errors better
    const responseText = await pythonResponse.text();

    if (!pythonResponse.ok) {
      let errorDetails = responseText;
      try {
        // Attempt to parse if the error response from Python is JSON
        errorDetails = JSON.parse(responseText);
      } catch (e) {
        // If not JSON, use the raw text
      }
      console.error('Error from Python service:', pythonResponse.status, errorDetails);
      return NextResponse.json(
        { 
          message: 'Error received from Python service.',
          statusCode: pythonResponse.status,
          details: errorDetails 
        },
        { status: pythonResponse.status }
      );
    }

    // If response is OK, assume it's JSON and parse it
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response from Python service:', e);
      return NextResponse.json(
        { message: 'Received non-JSON response from Python service.', details: responseText },
        { status: 502 } // Bad Gateway
      );
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in Python proxy API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Check for fetch errors specifically (e.g., service unavailable)
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

// Optional: GET handler for testing the proxy or its configuration
export async function GET() {
  if (!PYTHON_SERVICE_URL) {
    return NextResponse.json(
      { 
        status: 'misconfigured',
        message: 'Python Proxy API is misconfigured. PYTHON_SERVICE_URL is not set.' 
      }, 
      { status: 500 }
    );
  }
  return NextResponse.json({ 
    status: 'running',
    message: 'Python Proxy API is running. Use POST to send data.',
    python_service_target: PYTHON_SERVICE_URL 
  });
}
