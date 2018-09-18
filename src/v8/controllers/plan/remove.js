const ObjectID = require('mongodb').ObjectID


module.exports = async function remove (req, res) {
  try {
    let { _id } = req.params
    const plan_collection = req.db.collection('plans')
    plan_collection.deleteOne({ _id: ObjectID(_id) })
      .then(result => res.send(result))
      .catch(error => res.status(500).send('Internal Server Error'))
  }
  catch (e) {
    res.status(500).send('Internal Server Error')
  }
}


