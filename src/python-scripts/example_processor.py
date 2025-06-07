# src/python-scripts/example_processor.py
import os
from flask import Flask, request, jsonify
import spotipy
from dotenv import load_dotenv

# Load environment variables from .env file in the current directory
# This is useful if you run the python script directly for testing
# For actual deployment, environment variables should be set in the execution environment
load_dotenv() 

app = Flask(__name__)

# 🔹 Spotify App Credentials (loaded from environment variables)
# These should be set in the environment where this Python script runs.
# The .env file in the root of the Next.js project can define these
# (e.g., PYTHON_SPOTIPY_CLIENT_ID=your_id), and they will be picked up if you run
# this script in an environment that has those variables (e.g., a Docker container
# or a local shell where they are exported).
SPOTIPY_CLIENT_ID = os.environ.get("PYTHON_SPOTIPY_CLIENT_ID")
SPOTIPY_CLIENT_SECRET = os.environ.get("PYTHON_SPOTIPY_CLIENT_SECRET")

# Mock data (similar to what's in Next.js constants.ts) for placeholder responses
MOCK_SPOTIFY_PLAYLISTS_PY = [
  { 'id': 'p1', 'name': 'Chill Vibes Python', 'owner': 'Python User', 'trackCount': 50, 'imageUrl': 'https://placehold.co/100x100.png', 'description': 'Python version of chill vibes', 'tracks': [{'id': 's1py', 'name': 'Python Song 1', 'artist': 'Py Artist', 'album': 'Py Album'}]},
  { 'id': 'p2', 'name': 'Workout Hits Python', 'owner': 'Python User', 'trackCount': 30, 'imageUrl': 'https://placehold.co/100x100.png', 'description': 'Python version of workout hits'},
]
MOCK_SPOTIFY_LIKED_SONGS_PY = [
  { 'id': 's1py', 'name': 'Bohemian Rhapsody Python', 'artist': 'Queen Py', 'album': 'A Night at the Py Opera', 'imageUrl': 'https://placehold.co/60x60.png'},
  { 'id': 's2py', 'name': 'Blinding Lights Python', 'artist': 'The Weeknd Py', 'album': 'After Py Hours', 'imageUrl': 'https://placehold.co/60x60.png'},
]

def is_placeholder_token(token):
    return token is None or "placeholder" in token

# 🔹 Function to get all liked songs
def get_liked_songs(sp):
    songs = []
    results = sp.current_user_saved_tracks(limit=50)
    while results and "items" in results:
        for item in results["items"]:
            if item and item["track"] and item["track"]["id"]:
                 songs.append({
                    "id": item["track"]["id"],
                    "name": item["track"]["name"],
                    "artist": ", ".join([artist["name"] for artist in item["track"]["artists"]]),
                    "album": item["track"]["album"]["name"],
                    "imageUrl": item["track"]["album"]["images"][0]["url"] if item["track"]["album"]["images"] else None,
                    "dataAiHint": "music track" # Add a default hint
                })
        if results["next"]:
            results = sp.next(results)
        else:
            break
    return songs

# 🔹 Function to get all playlists
def get_playlists(sp):
    playlists_data = []
    results = sp.current_user_playlists()
    while results and "items" in results:
        for item in results["items"]:
            if item and item["id"]:
                playlists_data.append({
                    "id": item["id"],
                    "name": item["name"],
                    "owner": item["owner"]["display_name"] if item["owner"] else "Unknown",
                    "trackCount": item["tracks"]["total"] if item["tracks"] else 0,
                    "imageUrl": item["images"][0]["url"] if item["images"] else None,
                    "description": item.get("description", ""),
                    "dataAiHint": "music album" # Add a default hint
                })
        if results["next"]:
            results = sp.next(results)
        else:
            break
    return playlists_data

# 🔹 Function to get tracks from a playlist
def get_playlist_tracks_ids(sp, playlist_id):
    tracks_ids = []
    results = sp.playlist_tracks(playlist_id, fields="items(track(id)),next") # Only fetch track IDs
    while results and "items" in results:
        for item in results["items"]:
            if item and item["track"] and item["track"]["id"]:
                tracks_ids.append(item["track"]["id"])
        if results["next"]:
            results = sp.next(results)
        else:
            break
    return tracks_ids


@app.route('/fetch-source-data', methods=['POST'])
def fetch_source_data_route():
    data = request.get_json()
    source_token = data.get('source_token')

    if not SPOTIPY_CLIENT_ID or not SPOTIPY_CLIENT_SECRET:
        return jsonify({"error": "Spotify API client ID or secret not configured in Python service environment."}), 500

    if is_placeholder_token(source_token):
        # Simulate response if using placeholder token
        return jsonify({
            "playlists": MOCK_SPOTIFY_PLAYLISTS_PY,
            "likedSongs": MOCK_SPOTIFY_LIKED_SONGS_PY
        })

    try:
        # For real calls, ensure client_credentials_manager is appropriate or removed if auth flow handles tokens
        credentials_manager = spotipy.oauth2.SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
        sp_source = spotipy.Spotify(auth=source_token, client_credentials_manager=credentials_manager)
        
        playlists = get_playlists(sp_source)
        liked_songs = get_liked_songs(sp_source)
        
        return jsonify({
            "playlists": playlists,
            "likedSongs": liked_songs
        })
    except spotipy.exceptions.SpotifyException as e:
        app.logger.error(f"Spotify API error during fetch: {e}")
        return jsonify({"error": f"Spotify API error: {str(e)}", "details": "This might be due to an invalid or expired token, or API configuration issues."}), e.status_code if hasattr(e, 'status_code') else 500
    except Exception as e:
        app.logger.error(f"Error fetching source data: {e}")
        return jsonify({"error": "An internal error occurred in the Python script while fetching source data.", "details": str(e)}), 500

@app.route('/copy-items', methods=['POST'])
def copy_items_route():
    data = request.get_json()
    source_token = data.get('source_token')
    destination_token = data.get('destination_token')
    playlist_ids_to_copy = data.get('playlist_ids', [])
    song_ids_to_add_to_library = data.get('song_ids', [])

    if not SPOTIPY_CLIENT_ID or not SPOTIPY_CLIENT_SECRET:
        return jsonify({"error": "Spotify API client ID or secret not configured in Python service environment."}), 500

    if is_placeholder_token(source_token) or is_placeholder_token(destination_token):
        # Simulate success if using placeholder tokens
        message = f"Simulated: Copied {len(playlist_ids_to_copy)} playlists and {len(song_ids_to_add_to_library)} liked songs."
        return jsonify({"success": True, "message": message})

    try:
        credentials_manager = spotipy.oauth2.SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
        sp_source = spotipy.Spotify(auth=source_token, client_credentials_manager=credentials_manager)
        sp_destination = spotipy.Spotify(auth=destination_token, client_credentials_manager=credentials_manager)
        
        destination_user_id = sp_destination.me()["id"]
        
        copied_playlists_count = 0
        copied_songs_count = 0
        errors_encountered = []

        # Transfer Playlists
        for p_id in playlist_ids_to_copy:
            try:
                original_playlist = sp_source.playlist(p_id, fields="name,public,collaborative,description")
                new_playlist_name = original_playlist['name'] 

                new_playlist = sp_destination.user_playlist_create(
                    user=destination_user_id, 
                    name=new_playlist_name, 
                    public=original_playlist.get('public', True),
                    collaborative=original_playlist.get('collaborative', False),
                    description=original_playlist.get('description', '')
                )
                new_playlist_id = new_playlist["id"]

                track_ids_to_add = get_playlist_tracks_ids(sp_source, p_id)
                
                if track_ids_to_add:
                    for i in range(0, len(track_ids_to_add), 100):
                        sp_destination.playlist_add_items(new_playlist_id, track_ids_to_add[i:i+100])
                copied_playlists_count += 1
            except Exception as e_playlist:
                app.logger.error(f"Error copying playlist {p_id}: {e_playlist}")
                errors_encountered.append(f"Playlist {p_id} ('{original_playlist.get('name', 'Unknown name') if 'original_playlist' in locals() else 'Unknown ID'}'): {str(e_playlist)}")


        # Add Liked Songs
        if song_ids_to_add_to_library:
            valid_song_ids = [sid for sid in song_ids_to_add_to_library if sid]
            if valid_song_ids:
                # To preserve the original "Date Added" order (newest on top in Spotify UI),
                # the list of song IDs (which is typically newest to oldest if all selected from UI)
                # needs to be reversed. This way, the oldest songs are added to the library first,
                # and the newest songs are added last. When viewed in Spotify, the newest songs
                # (added last) will appear at the top.
                ids_to_add_in_order = list(reversed(valid_song_ids))
                for i in range(0, len(ids_to_add_in_order), 50): # Batches of 50 for adding to library
                    try:
                        sp_destination.current_user_saved_tracks_add(ids_to_add_in_order[i:i+50])
                    except Exception as e_songs:
                        app.logger.error(f"Error adding batch of liked songs: {e_songs}")
                        errors_encountered.append(f"Batch of Liked Songs (starting {ids_to_add_in_order[i]}): {str(e_songs)}")
                        # Decide if you want to stop or continue with other batches
                if not errors_encountered: # or based on a more specific check for song errors
                    copied_songs_count = len(valid_song_ids)
        
        message = f"Successfully attempted to copy {copied_playlists_count} playlists and {copied_songs_count} liked songs using Python."
        if errors_encountered:
            message += f" However, some errors occurred: {'; '.join(errors_encountered)}"
            return jsonify({"success": False, "message": message, "error_details": errors_encountered})

        return jsonify({"success": True, "message": message})

    except spotipy.exceptions.SpotifyException as e:
        app.logger.error(f"Spotify API error during copy: {e}")
        return jsonify({"error": f"Spotify API error: {str(e)}", "details": "This might be due to an invalid or expired token, or API config issues."}), e.status_code if hasattr(e, 'status_code') else 500
    except Exception as e:
        app.logger.error(f"Error copying items: {e}")
        return jsonify({"error": "An internal error occurred in the Python script while copying items.", "details": str(e)}), 500

# Placeholder for followed artists - not yet used by Next.js app
def get_followed_artists(sp):
    artists_ids = [] # Corrected variable name from 'artists' to 'artists_ids'
    results = sp.current_user_followed_artists(limit=50)
    # The API returns artists in a structure like: {"artists": {"items": [...], "next": ...}}
    while results and "artists" in results and results["artists"]["items"]:
        for item in results["artists"]["items"]:
            if item and item["id"]: # Ensure item and id exist
                artists_ids.append(item["id"])
        
        # Check if there's a next page and fetch it
        if results["artists"]["next"]:
            results = sp.next(results["artists"])
        else:
            break # No more pages
            
    return artists_ids

def transfer_followed_artists(sp_source, sp_destination):
    artist_ids = get_followed_artists(sp_source)
    if artist_ids:
        for i in range(0, len(artist_ids), 50): # Batches of 50 for following
            sp_destination.user_follow_artists(artist_ids[i:i+50])
    return len(artist_ids)


# Simple health check endpoint
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "Python Spotify service is running",
        "SPOTIPY_CLIENT_ID_CONFIGURED": bool(SPOTIPY_CLIENT_ID),
        "SPOTIPY_CLIENT_SECRET_CONFIGURED": bool(SPOTIPY_CLIENT_SECRET)
    }), 200

if __name__ == '__main__':
    if not SPOTIPY_CLIENT_ID or not SPOTIPY_CLIENT_SECRET:
        print("WARNING: PYTHON_SPOTIPY_CLIENT_ID or PYTHON_SPOTIPY_CLIENT_SECRET environment variables are not set.")
        print("The Python service might not be able to interact with Spotify API without them for real calls.")

    port = int(os.environ.get('PYTHON_SCRIPT_PORT', 5001))
    debug_mode = os.environ.get('PYTHON_DEBUG_MODE', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)

    