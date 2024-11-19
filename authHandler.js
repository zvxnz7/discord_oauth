import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

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
    // Fetch CLIENT_SECRET directly from Firestore
    fetchClientSecret()
        .then(CLIENT_SECRET => {
            if (CLIENT_SECRET) {
                // Now, exchange the authorization code for an access token
                fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: REDIRECT_URI,
                    })
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
                                    saveUserData(userData.id, code, accessToken, userData.username);

                                    // Display user-friendly information without sensitive details
                                    document.body.innerHTML = `
                                        <h1>Welcome, ${userData.username}!</h1>
                                        <p>Authentication successful. You are now logged in.</p>
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
                console.error('Failed to fetch CLIENT_SECRET from Firestore');
                document.body.innerHTML = '<h1>Failed to fetch CLIENT_SECRET</h1>';
            }
        })
        .catch(error => {
            console.error('Error fetching CLIENT_SECRET:', error);
            document.body.innerHTML = '<h1>Error fetching CLIENT_SECRET</h1>';
        });
} else {
    document.body.innerHTML = '<h1>No authorization code received!</h1>';
}

// Function to fetch CLIENT_SECRET from Firestore
async function fetchClientSecret() {
    const docRef = doc(db, "secrets", "CLIENT_SECRET");  // Corrected path to the document
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().value;  // Returning the secret value
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

// Function to save user data to Firestore
async function saveUserData(userId, authCode, accessToken, username) {
    try {
        await setDoc(doc(db, "users", username), {
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
