const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

async function get_db () {
  let url = process.env.MONGODB_URI
  const db = await MongoClient.connect(url)
  return db
}

async function clear_db() {
  const db = await get_db()
  await db.collection('users').removeMany({})
  await db.collection('instances').removeMany({})
  await db.collection('permissions').removeMany({})
  // await db.collection('record').removeMany({})
  // await db.collection('plan').removeMany({})
  // await db.collection('user').removeMany({})
  // await db.collection('geodata').removeMany({})
}

async function create_user(user) {
  const db = await get_db()

  const instance_result = await db.collection('instances').insertOne({
    name: 'test_instance'
  })

  const { insertedId } = await db.collection('users').insertOne({
    username: 'nd', 
    encrypted_password: await bcrypt.hash('m', 10),
    access_level: 'general',
    instances: [instance_result.insertedId],
    ...user
  })

  const api_key = uuid()
  await db.collection('sessions').insertOne({
    api_key,
    user_id: insertedId
  })

  const created_user = await db.collection('users').findOne({_id: insertedId})

  created_user.key = api_key

  return created_user
}

module.exports = {
  get_db,
  clear_db,
  create_user
}