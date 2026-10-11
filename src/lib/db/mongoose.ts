import mongoose from "mongoose";
import dns from "node:dns";
import "@/models";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // If already connected and ready, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If a connection promise is currently in-flight, await and return it
  if (cached.promise) {
    return cached.promise;
  }

  // If connection is in a half-open / broken state, reset it
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (_) {
      // Ignore disconnect error
    }
  }

  cached.conn = null;

  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hostelhub";
  const isAtlas = primaryUri.startsWith("mongodb+srv://");

  if (isAtlas) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (_) {}
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: isAtlas ? 10000 : 3000,
  };

  const localPersistentUri = "mongodb://127.0.0.1:27017/hostelhub";

  cached.promise = (async () => {
    // 1. Attempt connection with primary URI
    if (primaryUri && primaryUri !== "memory") {
      try {
        console.log(`[Database] Connecting to MongoDB: ${primaryUri.includes("@") ? primaryUri.split("@")[1] : primaryUri}`);
        const m = await mongoose.connect(primaryUri, opts);
        console.log("[Database] Connected successfully.");
        cached.conn = m;
        return m;
      } catch (err: any) {
        console.warn(`[Database] Primary connection failed: ${err.message}`);
      }
    }

    // 2. If primary failed and was not local persistent, try local 27017
    if (primaryUri !== localPersistentUri) {
      try {
        console.log(`[Database] Falling back to local persistent daemon at ${localPersistentUri}...`);
        const m = await mongoose.connect(localPersistentUri, opts);
        console.log("[Database] Connected to local persistent MongoDB daemon.");
        cached.conn = m;
        return m;
      } catch (err: any) {
        console.warn(`[Database] Local daemon connection failed: ${err.message}`);
      }
    }

    // 3. Fallback: Embedded MongoMemoryServer
    try {
      console.log("[Database] Starting embedded MongoMemoryServer fallback...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");

      if (cached.memoryServer) {
        try {
          await cached.memoryServer.stop();
        } catch (_) {}
        cached.memoryServer = null;
      }

      cached.memoryServer = await MongoMemoryServer.create();
      const memUri = cached.memoryServer.getUri();
      console.log(`[Database] MongoMemoryServer running at: ${memUri}`);
      const m = await mongoose.connect(memUri, { bufferCommands: false });
      console.log("[Database] Connected to MongoMemoryServer fallback.");
      cached.conn = m;
      return m;
    } catch (memErr: any) {
      console.error("[Database] Critical failure establishing MongoDB connection:", memErr);
      cached.conn = null;
      cached.promise = null;
      cached.memoryServer = null;
      throw new Error(
        "Unable to establish database connection. Please ensure MongoDB is running at mongodb://127.0.0.1:27017/hostelhub"
      );
    }
  })();

  try {
    const conn = await cached.promise;
    return conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export default connectDB;
