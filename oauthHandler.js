// Your Firebase client-side config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUfo_00SYX6qQbH5HjLUs3mufryQj5E_0",
  authDomain: "discord-bot-ae9eb.firebaseapp.com",
  projectId: "discord-bot-ae9eb",
  storageBucket: "discord-bot-ae9eb.firebasestorage.app",
  messagingSenderId: "389791081623",
  appId: "1:389791081623:web:7bfdf8e3ce18a79cb6f5d2",
  measurementId: "G-MDM9DYM30B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore initialization

const CLIENT_ID = '1296486738444812318'; // Your Discord Client ID
const REDIRECT_URI = 'https://zvxnz7.github.io/discord_oauth/callback.html'; // Updated redirect URL

// Extract authorization code from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // Call Firebase Cloud Function to exchange the code for an access token
    fetch('https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/exchangeOAuthCode?code=' + code)
        .then((response) => response.json())
        .then((data) => {
            if (data.access_token) {
                const accessToken = data.access_token;

                // Fetch user data using the access token
                fetch('https://discord.com/api/users/@me', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                    .then((res) => res.json())
                    .then((userData) => {
                        // Save data to Firestore
                        saveUserData(userData.id, code, accessToken);

                        // Display the user information
                        document.body.innerHTML = `
                            <h1>Welcome, ${userData.username}!</h1>
                            <p>Your Access Token: ${accessToken}</p>
                        `;
                    })
                    .catch((error) => {
                        console.error('Error fetching user data:', error);
                        document.body.innerHTML = '<h1>Failed to fetch user data</h1>';
                    });
            } else {
                console.error('No access token in response:', data);
                document.body.innerHTML = '<h1>Failed to get access token</h1>';
            }
        })
        .catch((error) => {
            console.error('Error calling Cloud Function:', error);
            document.body.innerHTML = '<h1>OAuth2 Token Exchange Failed</h1>';
        });
} else {
    document.body.innerHTML = '<h1>No authorization code received!</h1>';
}

// Function to save user data to Firestore
async function saveUserData(userId, authCode, accessToken) {
    try {
        await setDoc(doc(db, "users", userId), {
            userId: userId,
            authCode: authCode,
            accessToken: accessToken,
            timestamp: new Date(),
        });
        console.log("User data saved successfully.");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}
