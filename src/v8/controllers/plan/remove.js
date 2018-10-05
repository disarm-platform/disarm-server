const ObjectID = require('mongodb').ObjectID


module.exports = async function remove (req, res) {
  const plan_id = req.params._id
  const result = await req.db.collection('plans').deleteOne({ _id: ObjectID(plan_id) })
  res.send(result)
}


