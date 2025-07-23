const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' }); // Only load test env

module.exports = async () => {
  // Connect normally but to test database
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: 'kanban_test',
  });
  
  // Clean collections between tests
  await Promise.all(
    Object.values(mongoose.connection.collections).map(
      collection => collection.deleteMany({})
    )
  );
};

afterAll(async () => {
  await mongoose.disconnect();
});