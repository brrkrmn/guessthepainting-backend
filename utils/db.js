const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('strictQuery', false);

// Serverless invocations reuse the module scope but not the event loop, so the
// connection promise is cached globally and awaited per request instead of
// being fired once at import time.
const cache = globalThis.__mongooseConnection ?? { promise: null };
globalThis.__mongooseConnection = cache;

const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!cache.promise) {
    if (!config.MONGODB_URI) {
      return Promise.reject(new Error('MONGODB_URI is not set'));
    }

    console.log('Connecting to MONGODB...');
    cache.promise = mongoose
      .connect(config.MONGODB_URI, {
        // Fail fast with a real error instead of buffering until the
        // serverless function is killed.
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      .then((connection) => {
        console.log('Connected to MongoDB');
        return connection;
      })
      .catch((error) => {
        console.log('Error connecting to MongoDB: ', error.message);
        // Drop the rejected promise so the next request retries.
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
};

const databaseConnection = async (request, response, next) => {
  await connectToDatabase();
  next();
};

module.exports = { connectToDatabase, databaseConnection };
