const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
