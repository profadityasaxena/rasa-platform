import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

// Lazy singleton — connection is only established when the promise is first awaited
function makeClientPromise(): Promise<MongoClient> {
  // Cache at module level per env
  const key = "_mongoClientPromise"
  const g = global as unknown as Record<string, Promise<MongoClient> | undefined>
  if (g[key]) return g[key]!

  g[key] = (async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error("MONGODB_URI environment variable is not set.")
    const client = new MongoClient(uri)
    await client.connect()
    return client
  })()

  return g[key]!
}

// clientPromise is a Promise<MongoClient> that only resolves when first awaited at runtime
const clientPromise: Promise<MongoClient> = {
  then: (onFulfilled, onRejected) => makeClientPromise().then(onFulfilled, onRejected),
  catch: (onRejected) => makeClientPromise().catch(onRejected),
  finally: (onFinally) => makeClientPromise().finally(onFinally),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>

export default clientPromise

export async function getDb(dbName?: string) {
  const client = await clientPromise
  return client.db(dbName ?? undefined)
}

export async function getDebugDb() {
  const uri = process.env.MONGODB_URI_DEBUG
  if (!uri) throw new Error("MONGODB_URI_DEBUG is not set")
  const debugClient = new MongoClient(uri)
  await debugClient.connect()
  return debugClient.db()
}
