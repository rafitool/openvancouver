var genericGetAll = function(db, collection_name) {

    return function(req, res) {
      var result = [];
      db.collection(collection_name, function(err, collection) {
        collection.find().each(function(err, doc) {
          if(err) {
            res.send("Oops!: " + err);
          }
          if(!doc) {
            //When all the documents in the collection has been visited, output the result.
            res.send(result);
            return;
          }
          //add the current doc in the loop to the result
          result.push(doc);
        });
      });
    };
  };


var genericGetOne = function(db, collection_name) {

    return function(req, res) {
      db.collection(collection_name, function(err, collection) {
        collection.findOne({
          "_id": db.ObjectId(req.params.id)
        }, function(err, doc) {
          if(err) {
            res.send("Oops! " + err);
          }
          res.send(doc);
        });
      });
    };
  };



var genericCreate = function(db, collection_name) {



    return function(req, res) {
      req.body.like_count = 1;
      db.collection(collection_name, function(err, collection) {
        collection.save(req.body, {
          safe: true
        }, function(err, doc) {
          if(err) res.send("Oops!: " + err);
          if(doc) {
            res.send(doc);
          }
        });
      });
    };
  };


var genericUpdate = function(db, collection_name) {
    return function(req, res) {
      delete req.body._id;
      db.collection(collection_name, function(err, collection) {
        collection.findAndModify({
          "_id": db.ObjectId(req.params.id)
        }, [
          ['_id', 'asc']
        ], req.body, {
          new: true
        }, function(err, doc) {
          if(err) res.send("Oops!: " + err);
          if(doc) {
            res.send(doc);
          }
        });
      });
    };
  };


  var support = function(db, collection_name) {
    return function(req, res) {
      delete req.body._id;
      db.collection(collection_name, function(err, collection) {
        collection.findAndModify({
          "_id": db.ObjectId(req.params.id)
        }, [
          ['_id', 'asc']
        ], { $inc : { like_count : 1 }}, {
          new: true
        }, function(err, doc) {
          if(err) res.send("Oops!: " + err);
          if(doc) {
            res.send(doc);
          }
        });
      });
    };
  };


var genericDelete = function(db, collection_name) {

    return function(req, res) {

      db.collection(collection_name, function(err, collection) {
        collection.findAndModify({
          "_id": db.ObjectId(req.params.id)
        }, [
          ['_id', 'asc']
        ], {}, {
          remove: true
        }, function(err, object) {
          if(err) res.send("Oops!: " + err);
          var doc = JSON.stringify(object);
          res.send(doc);
        });
      });

    };

  };


exports.genericGetAll = genericGetAll;
exports.genericGetOne = genericGetOne;
exports.genericCreate = genericCreate;
exports.genericUpdate = genericUpdate;
exports.genericDelete = genericDelete;


exports.start = function(app, name, db, collection_name) {

  //GET all models
  app.get('/' + name, genericGetAll(db, collection_name));

  //GET a specific model
  app.get('/' + name + '/:id', genericGetOne(db, collection_name));

  //Create a model
  app.post('/' + name, genericCreate(db, collection_name));

  //Update a model
  app.put('/' + name + '/:id', genericUpdate(db, collection_name));

  //Update a model
  app.put('/' + name + '/support/:id', support(db, collection_name));

  //Delete a model
  app.delete('/' + name + '/:id', genericDelete(db, collection_name));

}