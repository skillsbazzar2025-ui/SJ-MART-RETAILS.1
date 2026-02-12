const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Express app
const app = require('./app');

// Port and Database URI
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: process.env.NODE_ENV === 'development', // Don't auto-index in production
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📁 Database: ${mongoose.connection.name}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('💡 Make sure MongoDB is running on your system');
        console.error('📌 Command to start MongoDB:');
        console.error('   Ubuntu: sudo systemctl start mongod');
        console.error('   macOS: brew services start mongodb-community');
        console.error('   Windows: net start MongoDB');
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION:', err);
    console.error('💥 Shutting down...');
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
    console.error('💥 Shutting down...');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Closing gracefully...');
    mongoose.connection.close(false, () => {
        console.log('📁 MongoDB connection closed');
        process.exit(0);
    });
});
