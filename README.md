# Playlist Porter 🎶

A **React.js web application** that helps users copy playlists and liked songs from one Spotify account to another. It integrates **Spotify's Web API** for music data and **Firebase** for authentication and temporary data storage.

---

## 🚀 Features

- **OAuth 2.0 Login with Spotify**  
  Securely authenticate with your Spotify account to fetch playlists and liked songs.

- **Select Playlists & Liked Songs**  
  View your playlists and liked tracks and choose which ones to copy.

- **Dual Spotify Login**  
  Authenticate with a new Spotify account to transfer the selected playlists and liked tracks.

- **Firebase Authentication & Firestore**  
  Optional Firebase login for enhanced user management and temporary data storage.

- **Modern UI with Material UI**  
  Clean and intuitive interface built with Material UI components.

---

## 🏗️ Tech Stack

- **Frontend:** React.js  
- **UI Library:** Material UI  
- **Authentication & Database:** Firebase Authentication, Firestore  
- **Music API:** Spotify Web API  
- **Build Tool:** Create React App  

---

## 🛠️ Setup & Run Locally

1. **Clone the repository:**
    ```bash
    git clone https://github.com/sthavirpunwatkar/spotify-copy-app.git
    cd spotify-copy-app
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure Firebase & Spotify:**  
    Create a `.env` file in the root folder with the following keys:
    ```env
    REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=sender_id
    REACT_APP_FIREBASE_APP_ID=app_id
    REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
    REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
    ```

4. **Start the development server:**
    ```bash
    npm start
    ```

---

## ⚠️ Important Notes

- Register your app on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to get the Client ID and Client Secret.
- Make sure the Spotify Redirect URI matches the one specified in your `.env` file.
- Enable Firebase Authentication and Firestore in your Firebase project.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for improvements.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌟 Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Firebase](https://firebase.google.com/)
- [Material UI](https://mui.com/)

---

## 📸 Screenshots

![Screenshot 1](https://github.com/user-attachments/assets/2960a132-9190-4c0c-9eb1-8ec07eb85a82)  
![Screenshot 2](https://github.com/user-attachments/assets/d9ef5636-a07d-42a5-bd70-895dbd48ec80)  
![Screenshot 3](https://github.com/user-attachments/assets/e49a15a2-d24d-44fa-807a-78f6c789acb0)  
![Screenshot 4](https://github.com/user-attachments/assets/5b384866-610d-4294-b625-037659159abc)  
![Screenshot 5](https://github.com/user-attachments/assets/24f18fc1-3330-4f4b-9854-ab9b8967c056)  
![Screenshot 6](https://github.com/user-attachments/assets/826ae44d-525e-4c26-a7cd-6b5fe7170f44)  
![Screenshot 7](https://github.com/user-attachments/assets/8f2707cf-75fc-4736-a5cd-ee7dd964d723)
