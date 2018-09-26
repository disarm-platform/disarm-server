const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {get} /config/:config_id Get config
 * @apiName Get Config
 * @apiGroup Config
 *
 * @apiParam {string} config_id The id of the config
 */

module.exports = async function findOne(req, res) {
  const config_id = req.params.config_id

  const config = await req.db.collection('instance_configs').findOne({ _id: ObjectID(config_id)})
  if (!config) {
    return res.status(400).send({error: 'invalid config_id'})
  }

  const allowed = await can(req.user._id, config.instance_id, 'basic')
  if (!allowed) {
    return res.status(401).send({ error: 'Not authorized' })
  }

  res.send(config)
}