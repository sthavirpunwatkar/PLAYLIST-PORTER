# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Integrating Custom Python Scripts

This project includes an example of how to integrate a custom Python script with the Next.js backend. This allows you to leverage Python for specific tasks while keeping your main application in Next.js.

-   A sample Python script using Flask is located at `src/python-scripts/example_processor.py`.
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
    The sample script uses Flask. Create a `requirements.txt` file in the `src/python-scripts` directory with the following content:
    ```txt
    Flask==3.0.0 # Or your desired version
    ```
    Then, install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Python script:**
    ```bash
    python example_processor.py
    ```
    By default, it will start a Flask development server on `http://localhost:5001`. You can configure the port and debug mode using environment variables:
    -   `PYTHON_SCRIPT_PORT`: Sets the port (e.g., `PYTHON_SCRIPT_PORT=5005 python example_processor.py`).
    -   `PYTHON_DEBUG_MODE`: Set to `true` to enable Flask's debug mode (e.g., `PYTHON_DEBUG_MODE=true python example_processor.py`).
    For production, you would typically use a WSGI server like Gunicorn.

### Configuration

The Next.js application needs to know where the Python service is running. This is configured in the `.env` file at the root of your project:

```env
PYTHON_SERVICE_URL=http://localhost:5001/process
```

-   `PYTHON_SERVICE_URL`: The full URL to the `/process` endpoint of your Python script.
Update this URL if your Python service runs on a different address, port, or endpoint.

The `.env` file can also include example environment variables for the Python script itself (like `PYTHON_SCRIPT_PORT`), but these are for documentation purposes; the Python script reads its environment variables from its own execution environment.

### Making Requests

Once both the Next.js app and the Python script are running, you can make POST requests to `/api/python-proxy` in your Next.js app. This route will forward the request to your Python service.

Example request body to `/api/python-proxy`:
```json
{
  "text": "Hello from Next.js"
}
```

Example response from the Python service via the proxy:
```json
{
  "original_input": "Hello from Next.js",
  "processed_output": "Python processed: HELLO FROM NEXT.JS",
  "message": "Data processed successfully by Python script!"
}
```
