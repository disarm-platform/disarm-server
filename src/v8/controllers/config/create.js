const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
/**
 * @api {post} /config/:instance_id Create instance
 * @apiName Create Instance Config
 * @apiGroup InstanceConfig
 *
 * @apiParam {string} name The name of the instance
 * @apiParamExample {json} Request-Example:
 *     {
 *      version: 1,
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
    .find({ 
      instance_id: ObjectID(instance_id) 
    }, {
      sort: { version: -1 },
      limit: 1
    })

  // if there is an existing config we bump the version, if not we start at 1
  const new_version = config_with_highest_version ? config_with_highest_version + 1 : 1

  await req.db.collection('instance_configs').insertOne({
    version: new_version,
    instance_id,
    ...req.body
  })

  res.send({status: 'success'})








  // const config_collection = req.db.collection('config');
  // const config_id = req.params['config_id'];
  // const config_data = req.body.config_data;
  // const calculated_id = `${config_data.config_id}@${config_data.config_version}`

  // if (config_id && (config_id === calculated_id)) {
  //   try {
  //     await config_collection.updateOne({ _id: config_id }, { ...req.body.config_data })
  //     res.status(201).send({ success: true })
  //   } catch (e) {
  //     console.log(e)
  //     res.status(500).send(e)
  //   }
  // } else {
  //   try {
  //     await config_collection.removeOne({ _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}` })
  //     await config_collection.insertOne({
  //       _id: `${req.body.config_data.config_id}@${req.body.config_data.config_version}`,
  //       ...req.body.config_data
  //     })
  //     res.status(201).send({ success: true })
  //   } catch (e) {
  //     console.log(e)
  //     res.status(500).send(e)
  //   }
  // }

}