const ObjectID = require('mongodb').ObjectID
const {can} = require('../../lib/helpers/can')
const {permissions} = require('../../lib/permissions')
const {isSuperset} = require('../../lib/helpers/array_utils')
/**
 * @api {post} /permission Create permission for user
 * @apiName Create permission for user
 * @apiGroup Permission
 *
 * @query{instance_id} the id of the instance whose permissions are being updated
 *
 * @apiParam {string} user_id The id of the user
 * @apiParamExample {json} Request-Example:
 *
 *     [{
 *      user_id:"<mongo_id>"
 *      instance_id: "<mongo_id>"",
 *      value : "read:irs_monitor"
 *     },...]
 */

module.exports = async function create(req, res) {
    const simple_permissions = req.body

    const instance_id  = ObjectID(req.query.instance_id)

    const instance = await req.db.collection('instances').findOne({_id:instance_id})

    if(!instance){
        return res.status(400).send('No existing instance');
    }

    const user_ids_from_database = (await req.db.collection('users')
        .find({}, {_id: 1}).toArray())
        .map(u => u._id.toString())

    // Incoming permissions should be for users in database, so remove any 
    // that do not have current users in DB
    const valid_permissions = simple_permissions.filter(permission => {
        return user_ids_from_database.includes(permission.user_id);
    }) 

    if (!valid_permissions.length === 0) {
        return res.status(400).send('No valid permissions sent.');
    }

    try {
        const permissions = valid_permissions
        .map(p => ({
            value: p.value,
            user_id: ObjectID(p.user_id),
            instance_id: ObjectID(p.instance_id)
        })) // Converting ids to mongodb objectid types

        await req.db.collection('permissions').removeMany({instance_id})
        const result = await req.db.collection('permissions').insertMany(permissions);
        res.status(201).send(result)

    }catch (e) {
        res.status(500).send(e.message)
    }
}

