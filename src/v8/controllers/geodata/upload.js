const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {summarise, validate_layer_schema} = require("@disarm/geodata-support");
module.exports = async function upload(req, res) {

    const instance_id = req.params['instance_id']
    const {name,data} = req.files.file

    const _data = JSON.parse(data.toString())
    try {
        const summary = summarise(_data)

        await req.db.collection('geodata').insertOne({
            instance_id: ObjectID(instance_id),
            level_name:name,
            summary,
            geojson:_data
        })

        res.send(summary);
    }catch (e) {
        res.status(400).send('Geodata nos saved')
    }

}