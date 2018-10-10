const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')
const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')

module.exports = async function create(req, res) {
  const records = req.db.collection('records')

    const instance_id = req.query.instance_id
    const instance = await req.db.collection('instances').findOne({ _id: ObjectID(instance_id)})
    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['write:irs_record_point'])
    if (!allowed) {
        return res.status(401).send()
    }

  let docs = req.body

  const ids = []

  for (const doc of docs) {
    if (!doc) continue
    const decorated = decorate_incoming_document({ doc, req })
    try {
      await records.insertOne(decorated)
      ids.push(decorated.id)
    } catch (e) {
      if (e.code === 11000) { // 11000 is an index violation
        ids.push(doc.id)
      } else {
        console.error(e)
      }
    }
  }

  return res.status(201).send(ids)
}