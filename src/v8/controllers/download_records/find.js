const  {process} = require('../../lib/helpers/csv-export/process')

const ObjectID = require('mongodb').ObjectID
const {can_any} = require('../../lib/helpers/can')

module.exports = async (req, res) => {
    const records_collection = req.db.collection('records')
    const personalised_instance_id = req.query.personalised_instance_id

    const instance_id = ObjectID(req.query.instance_id)
    const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
    if (!instance) {
        return res.status(400).send()
    }

    const allowed = await can_any(req.user._id, instance_id, ['read:irs_records_point'])
    if (!allowed) {
        return res.status(401).send()
    }
    try {
        const records = await records_collection
            .find({instance_id, personalised_instance_id})
            .sort({recorded_at: -1})
            .toArray()
        const csv_records = process(records)
        res.send(csv_records);

    } catch (e) {
        res.status(500).send(e.message);
    }

}