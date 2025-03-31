require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    encryptedPassword: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// API Endpoint - Register User
app.post('/register', async (req, res) => {
    try {
        const { username, encryptedPassword } = req.body;

        if (!username || !encryptedPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Save to MongoDB
        const newUser = new User({ username, encryptedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// API Endpoint - Retrieve Encrypted Password
app.post('/password', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ password: user.encryptedPassword }); // Ensure correct key name
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(express.static(path.join(__dirname, 'public', 'index.html')));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
