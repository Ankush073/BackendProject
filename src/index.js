import dotenv from 'dotenv';
import connectDB from './db/index.js';
import express from 'express';
import {app} from './app.js'
// Load environment variables from .env file
dotenv.config({
  path: './env'
});


const port = process.env.PORT || 9000;

// Function to start the server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB connected successfully');

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed', error);
  }
};

// Start the server
startServer();
