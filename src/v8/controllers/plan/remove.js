const ObjectID = require('mongodb').ObjectID

/**
 * @api {delete} /plan/:_id Remove plan
 * @apiName Remove Plan
 * @apiGroup Plan
 *
 * @apiParam {string} _id The id of the plan
 */

module.exports = async function remove (req, res) {
  const plan_id = req.params._id
  const result = await req.db.collection('plans').deleteOne({ _id: ObjectID(plan_id) })
  res.send(result)
}


