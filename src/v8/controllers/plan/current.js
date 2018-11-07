const ObjectID = require('mongodb').ObjectID
const { find_latest_plan } = require('../../lib/plan_helper')
const { can_any } = require('../../lib/helpers/can')
/**
 * @api {get} /plan/current Get latest plan
 * @apiName Get Latest Plan
 * @apiGroup Plan
 * @apiParam {string} instance_id The id of the instance
 * @apiParam {string} personalised_instance_id The personalised instance id
 */

module.exports = async function current(req, res) {

  const instance_id = req.query.instance_id
  const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send()
  }

  const allowed = await can_any(req.user._id, instance_id, ['read:irs_plan', 'read:irs_monitor'])
  if (!allowed) {
    return res.status(401).send()
  }

  const plan = await find_latest_plan(req)
  res.send(plan || {}) // maintaining old functionality, not sure how client handles this
}