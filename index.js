// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define the Break model
const Break = mongoose.model('Break', new mongoose.Schema({
  description: String,
  startTime: Date,
  endTime: Date,
  breakDuration: Number,
  intervalFromLastBreak: Number,
}));

// API routes
app.get('/api/breaks', async (req, res) => {
  try {
    const breaks = await Break.find();
    res.status(200).json(breaks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching breaks' });
  }
});

app.post('/api/start-break', async (req, res) => {
  const { description } = req.body;
  const startTime = new Date();
  const breakDoc = new Break({
    description,
    startTime,
    endTime: null,
    breakDuration: 0,
    intervalFromLastBreak: 0,
  });

  try {
    const savedBreak = await breakDoc.save();
    res.status(201).json(savedBreak);
  } catch (err) {
    res.status(500).json({ error: 'Error starting break' });
  }
});

app.post('/api/end-break/:id', async (req, res) => {
  const { id } = req.params;
  const { endTime } = req.body;

  try {
    const breakDoc = await Break.findById(id);
    if (!breakDoc) {
      return res.status(404).json({ error: 'Break not found' });
    }

    const breakDuration = (new Date(endTime) - new Date(breakDoc.startTime)) / 1000 / 60; // in minutes
    const intervalFromLastBreak = breakDoc.startTime ? (new Date() - breakDoc.startTime) / 1000 / 60 : 0;

    breakDoc.endTime = endTime;
    breakDoc.breakDuration = breakDuration;
    breakDoc.intervalFromLastBreak = intervalFromLastBreak;

    const updatedDoc = await breakDoc.save();
    res.status(200).json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: 'Error ending break' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
