const  {process} = require('../lib/csv-export/process')
module.exports = async (req, res) => {
    const records_collection = req.db.collection('records')
    const country = req.country
    const personalised_instance_id = req.personalised_instance_id
    try {
        const records = await records_collection
            .find({country, personalised_instance_id})
            .sort({recorded_at: -1})
            .toArray()
        console.log('records',records)
        const csv_records = process(records)
        res.send(csv_records);

    } catch (e) {
        res.status(500).send(e.message);
    }

}
