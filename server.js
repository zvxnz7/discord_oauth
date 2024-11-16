const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');

const PORT = 3000;

// Discord App Details
const CLIENT_ID = '1296486738444812318';
const CLIENT_SECRET = 'v2fEWyLbAUzWpu9ElxA5rclRL4hENDSo';
const REDIRECT_URI = 'http://localhost:3000/callback';

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Route: Home Page
app.get('/', (req, res) => {
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=1296486738444812318&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=identify+guilds.join+guilds`;
    res.render('index', { discordAuthUrl });
});

// Route: OAuth2 Callback
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('No authorization code provided.');
    }

    // Save the authorization code to a file
    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const accessToken = tokenResponse.data.access_token;

        // Use the access token to fetch user data or perform actions
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const username = userResponse.data.username;
        fs.writeFile('Codes.txt', `Username: ${username}, Access Token: ${accessToken} Authorization Code: ${code}\n`, { flag: 'a' }, (err) => {
            if (err) {
                console.error('Error saving auth code:', err);
            } else {
                console.log('Authorization code saved!');
            }
        });
        res.send(`
            <h1>Welcome, ${userResponse.data.username}!</h1>
            <p>Your Access Token: ${accessToken}</p>
        `);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Error exchanging token.');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
