const ObjectID = require('mongodb').ObjectID

module.exports = async function findOne (req, res) {
  try {
    const plan_collection = req.db.collection('plans')
    const plan_id = req.params.plan_id
    plan_collection
      .findOne({ _id: ObjectID(plan_id) }, (error, doc) => {
        if (error) {
          cosole.log('Error', error)
          res.status(500).send('Internal Server Error')
        } else {
          console.log('Doc', doc)
          res.send(doc)
        }
      })
  } catch (e) {
    console.log('Internal error', e)
    res.status(500).send('Internal Server Error')
  }
}