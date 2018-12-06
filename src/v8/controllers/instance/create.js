const {can} = require('../../lib/helpers/can')
/**
 * @api {post} /instance Create instance
 * @apiName Create Instance
 * @apiGroup Instance
 *
 * @apiParam {string} name The name of the instance
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Botswana 2018"
 *     }
 */

module.exports = async function create(req, res) {

  const allowed = await can(req.user._id)
  
  if (!allowed) {
    return res.status(401).send()
  }

  if (!req.body.name) {
    return res.status(400).send({error: 'name is required'})
  }

  const existing_name_count = await req.db.collection('instances').count({name: req.body.name})

  if(existing_name_count>0){
    return res.status(400).send('Instance Name Already exists')
  }

  try {
    const result = await req.db.collection('instances').insertOne({name: req.body.name})
    res.send(result)
  } catch (e) {
    res.status(500).send(e)
  }
}