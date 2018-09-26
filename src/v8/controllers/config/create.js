const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
/**
 * @api {post} /config/:instance_id Create instance config
 * @apiName Create Instance Config
 * @apiGroup InstanceConfig
 *
 * @apiParam {string} instance_id The id of the instance 
 * @apiParamExample {json} Request-Example:
 *     {
 *       ...instance_config
 *     }
 */


module.exports = async function create(req, res) {
  const instance_id = req.params['instance_id']
  
  const allowed = await can(req.user._id, instance_id, 'admin')
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized' })
  }

  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send({ error: 'invalid instance_id' })
  }
  

  const config_with_highest_version = await req.db.collection('instance_configs')
    .findOne({ 
      instance_id: ObjectID(instance_id) 
    }, {
      sort: { version: -1 },
      limit: 1
    })
  
  // if there is an existing config we bump the version, if not we start at 1
  const new_version = config_with_highest_version ? config_with_highest_version.version + 1 : 1
  await req.db.collection('instance_configs').insertOne({
    version: new_version,
    instance_id: ObjectID(instance_id),
    ...req.body
  })

  res.send({status: 'success'})
}