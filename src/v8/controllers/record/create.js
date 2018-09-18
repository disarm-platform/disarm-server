const { decorate_incoming_document } = require('../../lib/decorate_incoming_document')

module.exports = async function create(req, res) {
  const records = req.db.collection('records')

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