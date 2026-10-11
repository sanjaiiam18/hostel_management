import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
    };

    cached.promise = (async () => {
      let uri = process.env.MONGODB_URI;

      if (uri && uri !== "memory") {
        try {
          console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
          const m = await mongoose.connect(uri, opts);
          console.log("[Database] Successfully connected to configured MongoDB.");
          return m;
        } catch (err: any) {
          console.warn(`[Database] Could not connect to configured MongoDB (${err.message}). Falling back to MongoMemoryServer...`);
        }
      }

      // Memory Server fallback for zero-config testing / dev
      try {
        console.log("[Database] Starting embedded MongoMemoryServer fallback...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        if (!cached.memoryServer) {
          cached.memoryServer = await MongoMemoryServer.create();
        }
        const memUri = cached.memoryServer.getUri();
        console.log(`[Database] MongoMemoryServer started at: ${memUri}`);
        const m = await mongoose.connect(memUri, { bufferCommands: false });
        console.log("[Database] Connected to MongoMemoryServer successfully.");
        return m;
      } catch (memErr: any) {
        console.error("[Database] Critical failure starting MongoMemoryServer:", memErr);
        throw new Error("Unable to establish MongoDB connection. Please set a valid MONGODB_URI or check network.");
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
