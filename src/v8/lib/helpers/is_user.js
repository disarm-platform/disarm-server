const ObjectID = require('mongodb').ObjectID
const {get} = require('lodash')
const MongoClient = require('mongodb').MongoClient;

async function get_db() {
    let url = process.env.MONGODB_URI
    const db = await MongoClient.connect(url)
    return db
}

async function is_user(user_id, instance_id) {
    const db = await get_db()

    const users_permissions_for_instances = await db.collection('permissions').find({
        user_id: ObjectID(user_id),
        instance_id: ObjectID(instance_id)
    }).toArray()

    const user = await db.collection('users').findOne({_id: ObjectID(user_id)})

    return (!!(users_permissions_for_instances.length)) || get(user, 'deployment_admin', false)
}

module.exports = {
    is_user
}