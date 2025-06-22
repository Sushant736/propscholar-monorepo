import mongoose from 'mongoose';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('[INFO] Already connected to MongoDB');
      return;
    }

    try {
      const mongoUri = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_TEST_URI 
        : process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log(`[INFO] Connected to MongoDB: ${mongoUri}`);

      mongoose.connection.on('error', (error) => {
        console.error('[ERROR] MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[WARN] MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[INFO] MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('[ERROR] Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('[INFO] Disconnected from MongoDB');
    } catch (error) {
      console.error('[ERROR] Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const database = Database.getInstance(); 