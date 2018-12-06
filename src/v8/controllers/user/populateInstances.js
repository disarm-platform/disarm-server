const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')

module.exports = async function populateInstances(req, res) {
  const instance_id = req.query['instance_id']

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
       /* { remove empty list of instances, but I dont think any permission can have an
          '$match': {
            "list": {
              '$ne': []
            }
          }
        },*/
        {'$unwind': "$list"},
        {'$group': {'_id': "$list"}},
        {
          '$replaceRoot': {'newRoot': "$_id"}
        },
      ]
    }

  }]).toArray()


  res.send(users)
}