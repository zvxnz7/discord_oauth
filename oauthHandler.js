// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
const analytics = getAnalytics(app); // Optional analytics

const CLIENT_ID = '1296486738444812318'; // Your Discord Client ID
const CLIENT_SECRET = 'v2fEWyLbAUzWpu9ElxA5rclRL4hENDSo'; // Securely store this on the server side
const REDIRECT_URI = 'https://zvxnz7.github.io/discord_oauth/callback.html'; // Updated redirect URL

// Extract authorization code from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // Exchange the authorization code for an access token
    fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }),
    })
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
            console.error('Error exchanging code for token:', error);
            document.body.innerHTML = '<h1>OAuth2 Token Exchange Failed</h1>';
        });
} else {
    document.body.innerHTML = '<h1>No authorization code received!</h1>';
}

// Function to save user data to Firestore
async function saveUserData(userId, authCode, accessToken) {
    try {
        // Save user data to Firestore
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
