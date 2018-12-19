const {get_db}  = require('../../../../test/v8/helper');

const create = require('./create')
const find = require('./find')
const findOne = require('./findOne')
const remove = require('./remove')
const update = require('./update')
const findAll = require('./findAll')
const populateInstances = require('./populateInstances')


get_db() //TODO: maybe set indexes somewhere else
  .then(async db => {
      try{
          db.collection('users').createIndex({username:-1},{unique: true})
      }catch (e) {
          console.log('Index error',e)
      }
  }).catch(e => console.log("DB INDEX ERROR",e))


module.exports = {
    create,
    find,
    findOne,
    populateInstances,
    remove,
    findAll,
    update
}