const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

async function get_db() {
    let url = process.env.MONGODB_URI
    const db = await MongoClient.connect(url)
    return db
}

async function clear_db() {
    const db = await get_db()
    await db.collection('users').removeMany({})
    await db.collection('records').removeMany({})
    await db.collection('instances').removeMany({})
    await db.collection('permissions').removeMany({})
    await db.collection('instance_configs').removeMany({})
    await db.collection('geodata').removeMany({})
    await db.collection('plans').removeMany({})
    // await db.collection('user').removeMany({})
}

async function create_user(user) {
    const db = await get_db()

    const {insertedId} = await db.collection('users').insertOne({
        username: 'nd',
        encrypted_password: await bcrypt.hash('m', 10),
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