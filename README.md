# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Integrating Custom Python Scripts

This project includes an example of how to integrate a custom Python script with the Next.js backend. This allows you to leverage Python for specific tasks while keeping your main application in Next.js.

-   A Python script using Flask for Spotify operations is located at `src/python-scripts/example_processor.py`.
-   A Next.js API route at `src/app/api/python-proxy/route.ts` acts as a proxy to this Python service.

### Running the Python Service

The Python script runs as a separate service. You need to run it independently of the Next.js development server.

1.  **Navigate to the Python script directory:**
    ```bash
    cd src/python-scripts
    ```

2.  **Set up a Python virtual environment (recommended):**
    ```bash
    python -m venv .venv
    ```
    Activate it:
    -   On macOS/Linux: `source .venv/bin/activate`
    -   On Windows: `.venv\Scripts\activate`

3.  **Install dependencies:**
    The script uses Flask and Spotipy. A `requirements.txt` file is provided in the `src/python-scripts` directory.
    Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables for Python Service:**
    The Python service requires Spotify API credentials to interact with the Spotify API (even for Client Credentials flow or when using pre-obtained access tokens for some `spotipy` initializations). Create a `.env` file within the `src/python-scripts` directory (i.e., `src/python-scripts/.env`) or set these environment variables in your shell:
    ```env
    PYTHON_SPOTIPY_CLIENT_ID="your_spotify_developer_app_client_id"
    PYTHON_SPOTIPY_CLIENT_SECRET="your_spotify_developer_app_client_secret"
    # Optional: For running the Flask server directly
    # PYTHON_SCRIPT_PORT=5001
    # PYTHON_DEBUG_MODE=true
    ```
    These `PYTHON_SPOTIPY_CLIENT_ID` and `PYTHON_SPOTIPY_CLIENT_SECRET` variables are used by `spotipy` in `example_processor.py`.

5.  **Configure Spotify App Redirect URI in Spotify Developer Dashboard:**
    When you create/configure your app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/), you need to add a Redirect URI.
    *   For the current Next.js application (running on port `9002` by default), if you were to implement a full OAuth 2.0 Authorization Code Flow within Next.js, a suitable redirect URI would be `http://localhost:9002/api/auth/callback/spotify` (or similar, depending on your auth library/setup).
    *   Even if your primary interaction with Spotify from Python is server-to-server or using pre-fetched tokens, Spotify often requires at least one redirect URI to be registered.
    *   **Action:** Add `http://localhost:9002/api/auth/callback/spotify` (or another `http://localhost:...` URI like `http://localhost:8888/callback`) to your app's settings in the Spotify Developer Dashboard.

6.  **Run the Python script:**
    ```bash
    python example_processor.py
    ```
    By default, it will start a Flask development server on `http://localhost:5001`. You can configure the port and debug mode using environment variables `PYTHON_SCRIPT_PORT` and `PYTHON_DEBUG_MODE` (see step 4).
    For production, you would typically use a WSGI server like Gunicorn.

### Next.js Configuration for Python Proxy

The Next.js application needs to know where the Python service is running. This is configured in the `.env` file at the root of your project:

```env
PYTHON_SERVICE_URL=http://localhost:5001 # Base URL for the Python service
# PYTHON_SPOTIPY_CLIENT_ID and PYTHON_SPOTIPY_CLIENT_SECRET are also here for reference / potential use by Next.js if needed directly,
# but primarily they are for the Python environment.
PYTHON_SPOTIPY_CLIENT_ID="YOUR_SPOTIFY_APP_CLIENT_ID_HERE"
PYTHON_SPOTIPY_CLIENT_SECRET="YOUR_SPOTIFY_APP_CLIENT_SECRET_HERE"
```

-   `PYTHON_SERVICE_URL`: The base URL of your Python Flask service. The Next.js proxy will append specific endpoints (e.g., `/fetch-source-data`, `/copy-items`) to this URL.

### Making Requests

Once both the Next.js app and the Python script are running:
-   The Next.js application (specifically functions in `src/lib/actions.ts`) will make POST requests to its own `/api/python-proxy` route.
-   This proxy route will then forward these requests to the appropriate endpoint on your Python service (e.g., `http://localhost:5001/fetch-source-data`).

**Note on Spotify Authentication:**
The current Next.js application *simulates* Spotify user authentication and passes placeholder tokens to the Python backend. For the Python service to interact with the *real* Spotify API using user-specific data, the Next.js application would need to implement a full OAuth 2.0 flow to obtain genuine user access tokens and pass those to the Python service. The Python service is structured to use such tokens with Spotipy if provided. If placeholder tokens are detected, the Python service currently returns mock data.
```