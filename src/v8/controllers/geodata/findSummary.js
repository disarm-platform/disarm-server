const ObjectID = require('mongodb').ObjectID
const { is_user } = require('../../lib/helpers/is_user')

/**
 * @api {get} /geodata/:level_name Create geodata level
 * @apiName Get Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} level_name The id of the level
 */


module.exports = async function findOne(req, res) {
    const level_name = req.params['level_name']
    const instance_id = req.params['instance_id']

    const geodata_level_sumaries = await req.db.collection('geodata')
        .find({
            instance_id: ObjectID(instance_id),
            level_name
        }, {
            geojson:0
        }).toArray()


    if(!geodata_level_sumaries[0]){
        return res.send([])
    }

    const allowed = await is_user(req.user._id, geodata_level_sumaries[0].instance_id)
    if (!allowed) {
        return res.status(401).send({ error: 'Not authorized' })
    }

    res.send(geodata_level_sumaries)
}