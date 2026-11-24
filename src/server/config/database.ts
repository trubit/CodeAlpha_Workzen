import mongoose from 'mongoose';
import { ENV } from './env.js';

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'uninitialized';
  readyState: number;
  host?: string;
  name?: string;
  poolSize?: number;
}

export const getDatabaseHealth = (): DatabaseHealth => {
  const stateMap: Record<number, DatabaseHealth['status']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const readyState = mongoose.connection.readyState;
  const status = stateMap[readyState] || 'uninitialized';

  return {
    status,
    readyState,
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined
  };
};

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  const uri = ENV.NODE_ENV === 'test' ? ENV.MONGODB_TEST_URI : ENV.MONGODB_URI;

  try {
    // Register lifecycle listeners once
    mongoose.connection.on('connected', () => {
      console.log(`[WORKZEN Database] Connection established successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[WORKZEN Database] Runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[WORKZEN Database] Connection disconnected. MongoDB will attempt auto-reconnect.`);
    });

    mongoose.connection.on('reconnected', () => {
      console.log(`[WORKZEN Database] Connection re-established.`);
    });

    const conn = await mongoose.connect(uri, {
      autoIndex: ENV.NODE_ENV !== 'production',
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // IPv4 preference
    });

    return conn;
  } catch (error) {
    console.error(`[WORKZEN Database] Initial connection failed: ${(error as Error).message}`);
    console.warn(`[WORKZEN Database] Running with resilient offline mode. API will serve requests with health status 'disconnected'.`);
    
    if (ENV.NODE_ENV === 'production') {
      console.error(`[WORKZEN Database] Production environment requires database. Exiting.`);
      process.exit(1);
    }
    return null;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log(`[WORKZEN Database] Connection closed gracefully.`);
    }
  } catch (err) {
    console.error(`[WORKZEN Database] Error during disconnect: ${(err as Error).message}`);
  }
};
