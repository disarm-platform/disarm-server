const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {summarise, validate_layer_schema} = require("@disarm/geodata-support");

module.exports = async function upload(req, res) {

    const instance_id = req.query['instance_id']
    const level_name = req.body['level_name']
    const {name, data} = req.files.file

    const _data = JSON.parse(data.toString())

    try {
        const summary = summarise(_data)

        await req.db.collection('geodata').insertOne({
            instance_id: ObjectID(instance_id),
            level_name: level_name,
            filename: name,
            summary,
            geojson: _data,
            created_at: new Date()
        })

        res.send(summary);
    }catch (e) {
        res.status(400).send('Geodata nos saved')
    }

}