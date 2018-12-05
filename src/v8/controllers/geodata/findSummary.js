const ObjectID = require('mongodb').ObjectID
const {is_user} = require('../../lib/helpers/is_user')

/**
 * @api {get} /geodata/:level_name Create geodata level
 * @apiName Get Geodata Level
 * @apiGroup Geodata
 *
 * @apiParam {string} level_name The id of the level
 */


module.exports = async function findSummary(req, res) {
    const instance_id = req.params['instance_id']

    const allowed = await is_user(req.user._id, instance_id)
    if (!allowed) {
        return res.status(401).send({error: 'Not authorized'})
    }

    const query = {instance_id: ObjectID(instance_id)}

    const unique_levels = await req.db.collection('geodata').distinct('level_name',query)

    const geodata_level_summaries = unique_levels.reduce(async (acc,level_name) => {
        const level_query = {...query,level_name}
        const level_summaries = await req.db.collection('geodata')
            .find(level_query,
                {
                    geojson: 0 // Do not include geojson field
                }
            ).limit(5).toArray()
        return acc.concat(level_summaries)
    },[])

    res.send(geodata_level_summaries)
}