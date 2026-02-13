const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'super_secret_key_for_demo';

app.use(cors());
app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Helper to verify token (Mock)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        // Invalid token, treat as guest/anonymous depending on logic
        console.log('Invalid token');
    }
    next();
};

// Auth Endpoint
app.post('/api/auth/google', (req, res) => {
    const { token, userInfo } = req.body;

    // In a real app, we would verify the Google token with Google's API here.
    // For this demo, we accept the payload and create/update the user.

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    // Mock verification: assume token is valid
    const googleId = userInfo.id || 'mock_google_id_' + Date.now();
    const email = userInfo.email || 'mock@example.com';
    const name = userInfo.name || 'Mock User';

    db.run(`INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)
            ON CONFLICT(google_id) DO UPDATE SET email=excluded.email, name=excluded.name`,
        [googleId, email, name],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Get the user ID
            db.get("SELECT id FROM users WHERE google_id = ?", [googleId], (err, row) => {
                if (err || !row) return res.status(500).json({ error: 'User retrieval failed' });

                // Generate app token
                const appToken = jwt.sign({ id: row.id, google_id: googleId }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token: appToken, user: { id: row.id, name, email } });
            });
        }
    );
});

// Post Incident
app.post('/api/incidents', verifyToken, (req, res) => {
    const { lat, long, description, is_anonymous } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!lat || !long || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validation for anonymous reports
    if (!userId && !is_anonymous) {
        return res.status(401).json({ error: 'Must be logged in or report anonymously' });
    }

    // Logic: Anonymous reports are unverified by default.
    // Registered users could be auto-verified or require admin check.
    // Let's say registered users are trusted for this demo.
    const verified = userId ? 1 : 0;
    const isAnon = is_anonymous ? 1 : 0;

    const sql = `INSERT INTO incidents (user_id, lat, long, description, verified, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [userId, lat, long, description, verified, isAnon];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Incident reported successfully', id: this.lastID });
    });
});

// Get Incidents
app.get('/api/incidents', (req, res) => {
    const { hours, days, weeks, months } = req.query;

    let timeQuery = "";
    // Default to last 24 hours if nothing specified? Or return all?
    // Requirement says "expose service with location of last incidents in terms of hours, days..."

    // SQLite uses 'now' and modifiers
    if (hours) {
        timeQuery = `datetime('now', '-${hours} hours')`;
    } else if (days) {
        timeQuery = `datetime('now', '-${days} days')`;
    } else if (weeks) {
        timeQuery = `datetime('now', '-${weeks * 7} days')`;
    } else if (months) {
        timeQuery = `datetime('now', '-${months} months')`;
    } else {
        // Default limit? Let's return all for now or limit to 1 month
        timeQuery = `datetime('now', '-1 month')`;
    }

    const sql = `SELECT * FROM incidents WHERE timestamp > ${timeQuery} ORDER BY timestamp DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ incidents: rows });
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
