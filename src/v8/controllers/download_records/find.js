const  {process} = require('../../lib/helpers/csv-export/process')
const {findByApiKey} = require('../lib/auth')
const ObjectID = require('mongodb').ObjectID
const {can_any} = require('../../lib/helpers/can')

module.exports = async (req, res) => {
    const records_collection = req.db.collection('records')
    const personalised_instance_id = req.query.personalised_instance_id
    const download_key = req.query.download_key;

    const instance_id = ObjectID(req.query.instance_id)
    const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})


    if(!download_key){
        return res.status(403).send('Forbidden')
    }
    if(!findByApiKey(download_key)){
        return res.status(403).send('Forbidden')
    }

    if (!instance) {
        return res.status(400).send()
    }

    if (!allowed) {
        return res.status(401).send()
    }
    try {
        const records = await records_collection
            .find({instance_id, personalised_instance_id})
            .sort({recorded_at: -1})
            .toArray()
        const csv_records = process(records)
        const readStream = new stream.PassThrough();
        readStream.end(csv_records);
        res.set('Content-Type','Application/csv')
        res.set('Content-disposition', 'attachment; filename=records.csv');
        readStream.pipe(res);

    } catch (e) {
        res.status(500).send(e.message);
    }

}