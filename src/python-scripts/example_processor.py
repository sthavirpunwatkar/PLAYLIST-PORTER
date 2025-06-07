# src/python-scripts/example_processor.py
# This is a simple Flask-based Python script.
# To run this, you'll need Python installed, and Flask.
#
# 1. Create a virtual environment (optional but recommended):
#    python -m venv .venv
#    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
#
# 2. Create a requirements.txt file in this directory (src/python-scripts) with:
#    Flask==3.0.0 
#
# 3. Install dependencies:
#    pip install -r requirements.txt
#
# 4. To run the script:
#    python example_processor.py
#
# It will start a server, by default on http://localhost:5001.
# You can set PYTHON_SCRIPT_PORT and PYTHON_DEBUG_MODE environment variables.

from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400

        input_text = data['text']
        
        # Simulate your Python script's core logic here
        # For example, let's convert the text to uppercase
        processed_text = f"Python processed: {input_text.upper()}"
        
        return jsonify({
            "original_input": input_text,
            "processed_output": processed_text,
            "message": "Data processed successfully by Python script!"
        })
    except Exception as e:
        # Log the exception for server-side debugging
        print(f"Error during processing: {e}") 
        # Return a generic error to the client
        return jsonify({"error": "An internal error occurred in the Python script", "details": str(e)}), 500

# Simple health check endpoint
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Python service is running"}), 200

if __name__ == '__main__':
    # Use environment variable for port or default to 5001
    # In a production environment, you would use a proper WSGI server like Gunicorn
    # e.g., gunicorn -w 4 -b 0.0.0.0:5001 example_processor:app
    port = int(os.environ.get('PYTHON_SCRIPT_PORT', 5001))
    
    # Set debug mode based on environment variable, defaulting to False
    # For development: set PYTHON_DEBUG_MODE=true then run: python example_processor.py
    # For production or other environments, debug should be False.
    debug_mode = os.environ.get('PYTHON_DEBUG_MODE', 'False').lower() == 'true'
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
