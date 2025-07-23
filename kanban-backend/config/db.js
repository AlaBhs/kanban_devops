const mongoose = require('mongoose');

// Singleton pattern
let connection = null;

const connectDB = async () => {
  if (connection) return connection;
  
  try {
    connection = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.NODE_ENV === 'test' ? 'kanban_test' : 'kanban'
    });
    console.log('✅ MongoDB connected to', connection.connection.db.databaseName);
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Throw instead of exit
  }
};

module.exports = connectDB;