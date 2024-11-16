import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbSyocu6e8t7UTLJ4VBwULgBxt38ggw1k",
  authDomain: "casino777-7.firebaseapp.com",
  projectId: "casino777-7",
  storageBucket: "casino777-7.appspot.com",
  messagingSenderId: "824259346500",
  appId: "1:824259346500:web:1ace23689863864cc23c11",
  measurementId: "G-LHMDCMRY9E"
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
            console.log("CLIENT_SECRET value:", docSnap.data().value);  // Logging the value
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

// Function to create CLIENT_SECRET document in Firestore
async function createClientSecret() {
    const docRef = doc(db, "secrets", "CLIENT_SECRET");  // Path to the document
    try {
        await setDoc(docRef, { value: "your-secret-value-here" });
        console.log("CLIENT_SECRET document created with value.");
    } catch (error) {
        console.error("Error creating CLIENT_SECRET document:", error.message, error);
    }
}

// Call the function to create the document (this should only be done once)
createClientSecret();
