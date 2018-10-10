const get = require('lodash').get
const ObjectID = require('mongodb').ObjectID
const { can_any } = require('../../lib/helpers/can')

module.exports = async function get_updates(req, res) {
    const records = req.db.collection('records')

    const personalised_instance_id = req.query.personalised_instance_id

    const instance_id = req.query.instance_id
    const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['read:irs_records_point'])
    if (!allowed) {
        return res.status(401).send()
    }

    const last_id = req.body.last_id
    const limit = get(req, 'body.limit', 1000)

    let query
    if (last_id) {
        query = {instance_id, personalised_instance_id, _id: {$gt: new ObjectID(last_id)}}
    } else {
        query = {instance_id, personalised_instance_id}
    }

    records
        .find(query)
        .sort({_id: 1})
        .limit(limit)
        .toArray((err, docs) => {
            if (err) res.status(403).send(err)
            res.send(docs)
        })
}