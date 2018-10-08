const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')

/**
 * @api {get} /plan/detail/:plan_id Get plan
 * @apiName Get Plan
 * @apiGroup Plan
 *
 * @apiParam {string} plan_id The id of the plan
 */

module.exports = async function findOne(req, res) {
  const plan_id = req.params.plan_id
  const plan = await req.db.collection('plans').findOne({ _id: ObjectID(plan_id) })

  if (!plan) {
    return res.status(400).send()
  }

  const allowed = await can_any(req.user._id, plan.instance_id, ['read:irs_plan', 'read:irs_monitor', 'read:irs_tasker'])
  if (!allowed) {
    return res.status(401).send()
  }
  
  res.send(plan)
}