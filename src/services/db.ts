import dotenv from 'dotenv'

dotenv.config()
// type DBConnectionFunc = (connectFunc: Function) => Promise<void>

// These are wrapper functions around the mongoose connect and disconnect
// functions. These allow us to use these functions in the rest of the code
// but also be able to mock them with ts-mock-import.

async function dbConnect (connectFunc: Function) {
  const dbConnStr = process.env.DB_URL || 'mongodb://127.0.0.1:27017/Taskify'
  await connectFunc(dbConnStr)
}

async function dbDisconnect (disconnectFunc: Function) {
  await disconnectFunc()
}

export {
  dbConnect,
  dbDisconnect
}
