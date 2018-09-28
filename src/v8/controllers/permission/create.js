const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {post} /permission Create permission for user
 * @apiName Create permission for user
 * @apiGroup Permission
 *
 * @apiParam {string} user_id The id of the user 
 * @apiParamExample {json} Request-Example:
 *     {
 *       user_id: "<mongo_id>"",
 *       instance_id: "<mongo_id>"",
 *       value: "read:irs_monitor"
 *     }
 */

module.exports = async function create(req, res) {
  
}

