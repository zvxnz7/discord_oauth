const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// Cloud Function to exchange OAuth code for an access token
exports.exchangeOAuthCode = functions.https.onRequest(async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        // Fetch the client secret from Firestore
        const secretDoc = await admin.firestore().collection('secrets').doc('CLIENT_SECRET').get();
        if (!secretDoc.exists) {
            return res.status(500).send('Client secret not found');
        }
        const clientSecret = secretDoc.data().value;

        // Exchange the code for an access token using Discord's OAuth endpoint
        const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: 'YOUR_DISCORD_CLIENT_ID',
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'YOUR_REDIRECT_URI',
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Send the access token back to the client
        res.json({ access_token: response.data.access_token });

    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error during OAuth token exchange');
    }
});
