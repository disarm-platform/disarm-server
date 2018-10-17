const stream = require('stream')
const {findByApiKey} = require('../lib/auth')
const  {process} = require('../lib/csv-export/process')
module.exports = async (req, res) => {
    const records_collection = req.db.collection('records')
    const country = req.country
    const personalised_instance_id = req.personalised_instance_id
    const download_key = req.query.download_key;


    if(!download_key){
        return res.status(403).send('Forbidden')
    }
    if(!findByApiKey(download_key)){
        return res.status(403).send('Forbidden')
    }

    try {
        const records = await records_collection
            .find({country, personalised_instance_id})
            .sort({recorded_at: -1})
            .toArray()

        const csv_records = process(records)
        const readStream = new stream.PassThrough();
        readStream.end(csv_records);
        res.set('Content-Type','Application/csv')
        res.set('Content-disposition', 'attachment; filename=records.csv');
        readStream.pipe(res);

    } catch (e) {
        res.status(400).send('Error');
    }

}
