const create = require('./create')
const find = require('./find')
const findOne = require('./findOne')
const remove = require('./remove')
const update = require('./update')
const findAll = require('./findAll')
const populateInstances = require('./populateInstances')

module.exports = {
    create,
    find,
    findOne,
    populateInstances,
    remove,
    findAll,
    update
}