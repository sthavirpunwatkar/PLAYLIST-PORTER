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
    The Python service requires Spotify API credentials. Create a `.env` file within the `src/python-scripts` directory (i.e., `src/python-scripts/.env`) or set these environment variables in your shell:
    ```env
    PYTHON_SPOTIPY_CLIENT_ID="your_spotify_developer_app_client_id"
    PYTHON_SPOTIPY_CLIENT_SECRET="your_spotify_developer_app_client_secret"
    # Optional: For running the Flask server directly
    # PYTHON_SCRIPT_PORT=5001
    # PYTHON_DEBUG_MODE=true
    ```
    Alternatively, you can define `PYTHON_SPOTIPY_CLIENT_ID` and `PYTHON_SPOTIPY_CLIENT_SECRET` in the main `.env` file at the root of the project, and they will be available if the Python script is run in an environment that inherits them (e.g. some deployment setups, but not always when run locally with `python example_processor.py` unless explicitly loaded or exported). The `example_processor.py` script includes `python-dotenv` to load a `.env` file from its own directory if present.

5.  **Run the Python script:**
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
The current Next.js application *simulates* Spotify user authentication and passes placeholder tokens to the Python backend. For the Python service to interact with the *real* Spotify API, the Next.js application would need to implement a full OAuth 2.0 flow to obtain genuine user access tokens and pass those to the Python service. The Python service is structured to use such tokens with Spotipy if provided.
```
