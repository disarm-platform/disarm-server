const MongoClient = require('mongodb').MongoClient;

async function get_db () {
  let url = process.env.MONGODB_URI
  const db = await MongoClient.connect(url)
  return db
}

async function clear_db() {
  const db = await get_db()
  await db.collection('instance').removeMany({})
  // await db.collection('record').removeMany({})
  // await db.collection('plan').removeMany({})
  // await db.collection('user').removeMany({})
  // await db.collection('geodata').removeMany({})
}

module.exports = {
  get_db,
  clear_db
}