const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/btech_event_hub');
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n💡 [BTech Tip]: Ensure your local MongoDB database service is running!');
    console.log('💡 Run: "net start MongoDB" in Windows Administrator PowerShell or start MongoDB Compass.\n');
    process.exit(1);
  }
};

module.exports = connectDB;
