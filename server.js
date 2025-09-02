// server.js - Backend server for OpenAI API integration
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // npm install node-fetch@2
require('dotenv').config(); // npm install dotenv

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI API Key from .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in .env');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    '*'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public')); // Serve your HTML file from 'public' folder

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Received message: ${message}`);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are JASS GPT, a helpful and friendly AI assistant. Be conversational, informative, and concise. Respond as if you are having a natural conversation.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        frequency_penalty: 0.5,
        presence_penalty: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API Error:', errorData);

      if (openaiResponse.status === 401) {
        return res.status(401).json({ error: 'Invalid OpenAI API key' });
      } else if (openaiResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      } else {
        return res.status(500).json({
          error: 'OpenAI API error: ' + (errorData.error?.message || 'Unknown error')
        });
      }
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0].message.content.trim();

    console.log(`AI Response: ${aiResponse}`);

    res.json({
      success: true,
      response: aiResponse,
      model: 'gpt-3.5-turbo'
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    openai_configured: !!OPENAI_API_KEY
  });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (testResponse.ok) {
      res.json({ status: 'OpenAI API connection successful' });
    } else {
      res.status(400).json({
        status: 'OpenAI API connection failed',
        code: testResponse.status
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Test failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 OpenAI API Key configured: ${OPENAI_API_KEY ? '✅ Yes' : '❌ No'}`);
  console.log(`🔧 Test the API: http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
