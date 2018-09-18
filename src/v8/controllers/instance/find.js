const ObjectID = require('mongodb').ObjectID

/**
 * @api {get} /instance/:id Get instance
 * @apiName Get Instance
 * @apiGroup Instance
 *
 * @apiParam {string} id The name of the instance
 */

module.exports = async function find(req, res) {

  // TODO: auth, check if user can get instance, i.e. if they have permission
  const allowed = true
  if (!allowed) {
    return res.status(403).send()
  }

  if (!req.param.id) {
    return res.status(400).send({ error: 'id is required' })
  }

  try {
    const instance = await req.db.instance.findOne({ _id: ObjectID(req.param.id) })
    res.send(instance)
  } catch (e) {
    res.status(500).send(e)
  }
}