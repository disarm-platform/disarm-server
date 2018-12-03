const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {summarise, validate_layer_schema} = require("@disarm/geodata-support");
module.exports = async function upload(req, res) {
    const instance_id = req.params['instance_id']

    const {name,data} = req.files.file
    _data = JSON.parse(data.toString())
    const summary = summarise(_data)
    
    const geodata_level_with_highest_version = await req.db.collection('geodata')
        .findOne({
            instance_id: ObjectID(instance_id),
            level_name:name
        }, {
            sort: {version: -1},
            limit: 1
        })

    // if there is an existing geodata level we bump the version, if not we start at 1
    const new_version = geodata_level_with_highest_version ? geodata_level_with_highest_version.version + 1 : 1


    await req.db.collection('geodata').insertOne({
        version: new_version,
        instance_id: ObjectID(instance_id),
        level_name:name,
        summary,
        geojson:_data
    })

    res.send(summary);
}