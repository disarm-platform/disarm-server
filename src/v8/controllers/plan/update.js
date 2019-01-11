const ObjectID = require('mongodb').ObjectID
const { filter_plan_targets_for_focus_area } = require('../../lib/plan_helper')
const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')
const { can_any } = require('../../lib/helpers/can')

/**
 * @api {put} /plan/:_id Update plan
 * @apiName Update Plan
 * @apiGroup Plan
 * 
 * @apiParam {string} _id The id of the plan
 * @apiParam {string} instance_id The id of the instance
 * @apiParamExample {json} Request-Example:
 *     {
 *       ...plan
 *     }
 */

module.exports = async function update (req, res) {
  let { _id } = req.params

  const plan = await req.db.collection('plans').findOne({_id: ObjectID(_id)})
  if (!plan) {
    return res.status(400).send({error: '_id (plan_id) is invalid'})
  }

  const instance_id = req.query.instance_id
  const instance = await req.db.collection("instances").findOne({_id: ObjectID(instance_id)})
  if (!instance) {
    return res.status(400).send({ error: 'instance_id is invalid' })
  }


  const allowed = await can_any(req.user._id, instance_id, ['write:irs_plan', 'write:irs_monitor', 'write:irs_tasker'])
  if (!allowed) {
    return res.status(401).send({error: 'Not authorised'})
  }


  const plan_collection = req.db.collection('plans')
  let incoming_plan = decorate_incoming_document({ doc: req.body, req })
  plan_collection
    .findOne({ _id: ObjectID(_id) })
    .then(async current_plan => {
      if (incoming_plan.focus_filter_area) {
        try {
          incoming_plan = await filter_plan_targets_for_focus_area(req, incoming_plan, current_plan)
        } catch (e) {
          return res.status(400).send({ message: e })
        }
      }

      delete incoming_plan._id
      plan_collection.updateOne({ _id: ObjectID(_id) }, { ...incoming_plan })
        .then(saved => res.send(saved))
        .catch(error => res.status(500).send('There was an error while saving'))
    })
    .catch(error => {
      res.status(404).send('Plan could not be found')
    })
}