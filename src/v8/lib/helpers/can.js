const ObjectID = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;

async function get_db() {
  let url = process.env.MONGODB_URI
  const db = await MongoClient.connect(url)
  return db
}

async function can(user_id, instance_id, permission_string) {
  // TOOD: Fix this, there is no global db, only available in requests
  const db = await get_db()
  
  // get user
  const user = await db.collection('users').findOne({ _id: ObjectID(user_id)})
  
  if (!user) {
    return false
  }
  
  // if they are a deployment_admin, they can do anything
  if (user.deployment_admin) {
    return true
  } 

  const admin_permission = await db.collection('permissions').findOne({
    user_id: ObjectID(user_id),
    instance_id: ObjectID(instance_id),
    value: 'admin'
  })
  // if user is admin for that instance, return true
  if (admin_permission) {
    return true
  } 


  // check if user has permission for instance_id
  const permission = {
    user_id: ObjectID(user_id),
    instance_id: ObjectID(instance_id),
    value: permission_string
  }

  const found_permission = await db.collection('permissions').findOne(permission)
  
  // return true or false
  return !!(found_permission)
}

module.exports = {
  can
}