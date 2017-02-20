const express = require('express')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const cors = require('cors')
const bodyParser = require('body-parser');
const Raven = require('raven')
const fetch = require('node-fetch');



MongoClient.connect(process.env.MONGODB_URI).then((db) => {
  console.log('Connected to db')

  Raven.config('https://ed8917e61540404da408a2a9efba0002:d99248fd72c140398999c7302e1da94b@sentry.io/138843').install()

  const app = express()
  app.use(Raven.requestHandler())

  app.use(cors())
  app.use(bodyParser.json({limit: '500mb'}))

  let Clusters = db.collection('clusters')
  let Tasks = db.collection('tasks')
  let SpatialEntities = db.collection('spatial_entities')
  let SpatialEntityPoints = db.collection('spatial_entity_points')

  app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  });

  app.get('/', (req, res) => {
    res.send({data: "DOUMA API v0.4"})
  })


/**
 * @api {get} /clusters Get clusters
 * @apiName GetCluster
 * @apiGroup Clusters
 *
 * @apiParam {Array} ids Cluster ids
 * @apiParam {Array} locationObjects Location objects {location_type: 'region', name: 'Hhohho', ...}
 *
 * @apiSuccess {Array} clusters Array of cluster objects
 */


  app.get('/clusters', (req, res) => {
    console.log('GET /clusters')

    let search = {}

    if (req.query.ids) {
      // Find by IDs
      const ids = JSON.parse(req.query.ids || '[]') 
      search = {_id: {$in: ids}}
      
    } else if (req.query.locations) {

      // Find by locations
      let array = []
      const locations = JSON.parse(req.query.locations || '[]') 

      locations.forEach(({location_type, name}) => {
        let obj = {}
        obj['location.' + location_type] = name
        array.push(obj)
      })

      search = {$or: array}
    }

    if (req.query.demo_instance_id) {
      search.demo_instance_id = req.query.demo_instance_id
    }

    Clusters.find(search).toArray((err, docs) => {
      res.send({data: docs})
    })

  })

  /**
 * @api {post} /clusters Create clusters
 * @apiName CreateClusters
 * @apiGroup Clusters
 *
 * @apiParamExample {json} Request-Example: 
                  [ {"cluster_id": 1, "cluster_collection_id": "76854", "task_ids": ["7545123", "123761"], ...}]
 * @apiSuccess {Array} clusters Array of cluster objects
 */

  app.post('/clusters', (req, res) => {
    console.log('POST cluster', req.body)
    if (!Array.isArray(req.body)) {
      return res.status(400).end()
    }

    let clusters = req.body

    
    let cluster_promises = clusters.map((cluster) => {

      if (!Array.isArray(cluster.spatial_entity_ids)) {
        throw new Error(`Not an array ${JSON.stringify(cluster.spatial_entity_ids)}`) 
      }

      let task_promises = cluster.spatial_entity_ids.map((spatial_entity_id) => {
        return Tasks.find({spatial_entity_id})
          .toArray()
          .then((task) => {
            if (task.length === 0)  {
              return Tasks.insert({
                properties: {
                  status: 'unvisited'
                },
                task_date: new Date(),
                task_type: "irs_record",
                demo_instance_id: cluster.demo_instance_id,
                spatial_entity_id
              })
            } else {
              return new Promise((resolve, reject) => resolve())
            }
          })
      })

      return Promise.all(task_promises).then((results) => {
        let task_ids = []


        results
        .filter(r => r)
        .filter(({result}) => {
          if (result) {
            return result.ok === 1  
          }
          return false
        })
        .forEach(({insertedIds}) => {
          if (insertedIds) {
            insertedIds.forEach((id) => task_ids.push(id))  
          }
        })

        cluster.task_ids = task_ids

        return Clusters.insert(cluster)
      })
    })
    

    Promise.all(cluster_promises).then((clusters) => {
      res.send(`Inserted ${clusters.length} clusters`)
      send_push(`${clusters.length} new clusters on DiSARM`)
    }).catch((err) => {
      console.log('error here', err)
      res.status(500).send('Something broke!')
    })
  })

    /**
 * @api {put} /clusters Update clusters
 * @apiName UpdateClusters
 * @apiGroup Clusters
 *
 * @apiParamExample {json} Request-Example: 
                  [ {"cluster_id": 1, "cluster_collection_id": "76854", "task_ids": ["7545123", "123761"], ...}]
 */

 app.put('/clusters', (req, res) => {
  console.log('PUT Clusters', req.body)
    let docs = req.body

    if (!Array.isArray(req.body)) {
      return res.status(400).end()
    }

    console.log("Count of docs to update:", docs.length)
    // TODO: @feature Set default properties

    let cluster_promises = docs.map((doc) => {
      return new Promise((resolve, reject) => {
        doc._id = new ObjectID(doc._id)
        const query = {_id: doc._id}
        const update = doc

        Clusters.update(query, update, {upsert: false}, (err, response) => {
          if (err) {
            console.log(err)
            resolve({error: err})
          } else {
            resolve({success: response, _id: doc._id})
          }
        })
      })
    })

    Promise.all(cluster_promises)
    .then(results => {
      global.results = results
      // res.send(results)
      
      const results_for_client = results.reduce((output, result) => {
        if(result.hasOwnProperty('success')) {
          output.modified.push(result._id)
        } else if(result.hasOwnProperty('error')) {
          output.errors.push(result.error)
        }
        return output
      }, {modified:[], errors:[]})
      
      console.log(results_for_client)

      res.send(results_for_client)
    }).catch((error) => console.error(error))
 })


/**
 * @api {get} /tasks Get tasks
 * @apiName GetTasks
 * @apiGroup Tasks
 *
 * @apiParam {Array} ids Task ids
 * @apiParam {Array} spatial_entity_ids Spatial entity ids or osm_ids
 *
 * @apiSuccess {Array} clusters Array of task objects
 */
  
  app.get('/tasks', (req, res) => {
    console.log('GET /tasks')

    let search = {}

    if (req.query.ids) {
      const ids = JSON.parse(req.query.ids).map(id => new ObjectID(id)) //TODO: @debug fix ObjectID
      search = {_id: {$in: ids}}
    } else if (req.query.spatial_entity_ids) {
      const spatial_entity_ids = JSON.parse(req.query.spatial_entity_ids)
      search = {spatial_entity_id: {$in: spatial_entity_ids}}
    }

    if (req.query.demo_instance_id) {
      search.demo_instance_id = req.query.demo_instance_id
    }
    
    Tasks.find(search).toArray((err, docs) => {
      res.send({data: docs})
    })
  })

/**
 * @api {put} /tasks Update tasks
 * @apiName UpdateTasks
 * @apiGroup Tasks
 *
 * @apiParamExample {json} Sending an Array: 
                  [ {"task_date": "14th February 2017", "task_type": "irs_record", "spatial_entity_id": "768152631"}, ...]
 */

  app.put('/tasks', (req, res) => {
    console.log('PUT Tasks', req.body)
    let docs = req.body

    if (!Array.isArray(req.body)) {
      return res.status(400).end()
    }

    console.log("Count of docs to update:", docs.length)
    // TODO: @feature Set default properties

    let task_promises = docs.map((doc) => {
      return new Promise((resolve, reject) => {
        doc._id = new ObjectID(doc._id)
        const query = {_id: doc._id}
        const update = doc

        Tasks.update(query, update, {upsert: false}, (err, response) => {
          if (err) {
            console.log(err)
            resolve({error: err})
          } else {
            resolve({success: response, _id: doc._id})
          }
        })
      })
    })

    Promise.all(task_promises)
    .then(results => {
      global.results = results
      // res.send(results)
      
      const results_for_client = results.reduce((output, result) => {
        if(result.hasOwnProperty('success')) {
          output.modified.push(result._id)
        } else if(result.hasOwnProperty('error')) {
          output.errors.push(result.error)
        }
        return output
      }, {modified:[], errors:[]})
      
      console.log(results_for_client)

      res.send(results_for_client)
    }).catch((error) => console.error(error))

    // Tasks.insert(docs, (err, result) => {
    //   if (err) {
    //     res.send(err)    
    //   } else {
    //     res.send(result)
    //   }
      
    // })
  })


/**
 * @api {get} /spatial_entities Get spatial entities
 * @apiName GetSpatialEntities
 * @apiGroup SpatialEntities
 *
 * @apiParam {Array} ids Task ids
 * @apiParam {Array} spatial_entity_ids Spatial entity ids or osm_ids
 *
 * @apiSuccess {Array} clusters Array of spatial entity objects
 */
  app.get('/spatial_entities', (req, res) => {
    console.log('GET /spatial_entities')

    let search = {}

    if (req.query.ids) {
      const ids = JSON.parse(req.query.ids)
      search = {"properties.osm_id": {$in: ids}}
    } 
     
    SpatialEntities.find(search).toArray((err, docs) => {
      res.send({data: docs})
    })
  })

  /**
 * @api {post} /spatial_entities Create spatial entity
 * @apiName CreateSpatialEntities
 * @apiGroup SpatialEntities
 *
 * @apiParamExample {json} Sending Array: 
                  [ {"osm_id": "123123", "polygon": {...}}, ...]
* @apiParamExample {json} Sending Object: 
                  {"osm_id": "123123", "polygon": {...}}
 */

  app.post('/spatial_entities', (req, res) => {
    console.log('POST SE', req.body)

    // TODO: @feature Set default properties

    SpatialEntities.insert(req.body, (err, result) => {
      if (err) {
        res.send({data: 'Success' })    
      } else {
        res.send(result)
      }
      
    })
  })

  /**
 * @api {get} /spatial_entity_points Get spatial entity points
 * @apiName GetSpatialEntityPoints
 * @apiGroup SpatialEntityPoints
 *
 * @apiParam {Array} ids Spatial entity ids
 *
 * @apiSuccess {Array} points Array of spatial entity points
 */
  app.get('/spatial_entity_points', (req, res) => {
    console.log('GET /spatial_entity_points')

    let search = {}

    if (req.query.ids) {
      const ids = JSON.parse(req.query.ids)//.map(id => new ObjectID(id)) //TODO: @debug fix ObjectID
      search = {_id: {$in: ids}}
    } 
     
    SpatialEntityPoints.find(search).toArray((err, docs) => {
      res.send({data: docs})
    })
  })

  /**
 * @api {post} /spatial_entity_points Create spatial entity points
 * @apiName CreateSpatialEntityPoints
 * @apiGroup SpatialEntityPoints
 * @apiParamExample {json} Sending Array: 
                  [ {"type": "Feature", "properties": {...}, "geometry": {...}, ...]
 *
 */

  app.post('/spatial_entity_points', (req, res) => {
    console.log('POST /spatial_entity_points', req.body)

    // TODO: @feature Set default properties

    SpatialEntityPoints.insert(req.body, (err, result) => {
      if (err) {
        res.send({data: 'Success' })    
      } else {
        res.send(result)
      }
      
    })
  })

  app.use(Raven.errorHandler())


  app.listen(process.env.PORT || 3000, () => {
    console.log('[DOUMA API] Listening on port ' + (process.env.PORT || 3000))
  })

}).catch((err) => console.log(err))


function send_push(text) {
  const data = {
    app_id: process.env.ONESIGNAL_APP_ID,
    contents: {
      en: text,
    },
    included_segments: ['All Users']
  }

  const options = { 
    method: 'POST', 
    body: JSON.stringify(data), 
    headers: {
      'Content-Type': 'application/json',
      "Authorization": "Basic " + process.env.ONESIGNAL_API_KEY
    } 
  }

  return fetch('https://onesignal.com/api/v1/notifications', options)
    .then(res => res.json())
    .then(data => console.log(data))
    
}