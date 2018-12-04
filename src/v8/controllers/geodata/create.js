const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {summarise, validate_layer_schema} = require("@disarm/geodata-support");
/**
 * @api {post} /geodata/:instance_id Create geodata level
 * @apiName Create Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} name The name of the instance
 * @apiParamExample {json} Request-Example:
 *     {
 *       level_name: 'villages',
 *       geojson: <geojson>
 *     }
 */

module.exports = async function post(req, res) {
    const instance_id = req.params['instance_id']

    const allowed = await can(req.user._id, instance_id, 'admin')
    if (!allowed) {
        return res.status(401).send({error: 'Not authorized'})
    }

    const instance = await req.db.collection('instances').findOne({_id: ObjectID(instance_id)})
    if (!instance) {
        return res.status(400).send({error: 'invalid instance_id'})
    }

    const level_name = req.body.level_name
    if (!level_name) {
        return res.status(400).send({error: 'no level_name'})
    }

    const geojson = req.body.geojson
    if (!geojson) {
        // TODO: Should test the validity of the geojson
        return res.status(400).send({error: 'no geojson'})
    }

    const summary = summarise(geojson)


    const geodata_level_with_highest_version = await req.db.collection('geodata')
        .findOne({
            instance_id: ObjectID(instance_id),
            level_name
        }, {
            sort: {version: -1},
            limit: 1
        })

    // if there is an existing geodata level we bump the version, if not we start at 1
    const new_version = geodata_level_with_highest_version ? geodata_level_with_highest_version.version + 1 : 1

    await req.db.collection('geodata').insertOne({
        version: new_version,
        instance_id: ObjectID(instance_id),
        level_name,
        summary,
        geojson
    })

    res.send({status: 'success'})
}