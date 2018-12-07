const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {sanitize_users} = require("./sanitize_users");


/**
 * Return all users with the instances they have permissions on
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports = async function populateInstances(req, res) {
  // const instance_id = req.query['instance_id']

  const allowed = req.user.deployment_admin
  if (!allowed) {
    return res.status(401).send()
  }

  const users = await req.db.collection('users').aggregate([{
    '$lookup': {
      'from': "permissions",
      'let': {'user_id': "$_id"},
      'as': "instances",
      'pipeline': [{
        '$lookup': {
          'from': "instances",
          'let': {
            'userid': "$$user_id",
            'user_id': "$user_id",
            'instance_id': "$instance_id"
          },
          'as': "list",
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {
                      '$eq': [
                        "$_id",
                        "$$instance_id"
                      ]
                    },
                    {
                      '$eq': [
                        "$$userid",
                        "$$user_id"
                      ]
                    }
                  ]
                }
              }
            }
          ]
        },
      },
        {'$unwind': "$list"},
        {'$group': {'_id': "$list"}},
        {
          '$replaceRoot': {'newRoot': "$_id"}
        },
      ]
    }

  }]).toArray()


  res.send(sanitize_users(users))
}