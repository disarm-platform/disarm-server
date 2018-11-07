const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')

/**
 * @api {delete} /plan/:_id Remove plan
 * @apiName Remove Plan
 * @apiGroup Plan
 *
 * @apiParam {string} _id The id of the plan
 */

module.exports = async function remove (req, res) {
  const plan_id = req.params._id
  const plan = await req.db.collection('plans').findOne({_id: ObjectID(plan_id)})
  if (!plan) {
    return res.status(400).send()
  }

  const allowed = await can_any(req.user._id, plan.instance_id, ['write:irs_plan', 'write:irs_monitor', 'write:irs_tasker'])
  if (!allowed) {
    return res.status(401).send()
  }

  const result = await req.db.collection('plans').deleteOne({ _id: ObjectID(plan_id) })
  res.send(result)
}


