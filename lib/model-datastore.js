'use strict';

const Datastore = require('@google-cloud/datastore');
const config = require('../config');

const ds = Datastore({
    projectId: config['GCLOUD_PROJECT']
});
const kind = 'Snapshot';

// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
function fromDatastore(obj) {
    obj.id = obj[Datastore.KEY].id;
    return obj;
}

// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
function toDatastore(obj, nonIndexed) {
    nonIndexed = nonIndexed || [];
    let results = [];
    Object.keys(obj).forEach((k) => {
        if (obj[k] === undefined) {
            return;
        }
        results.push({
            name: k,
            value: obj[k],
            excludeFromIndexes: nonIndexed.indexOf(k) !== -1
        });
    });
    return results;
}

// Lists all books in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, books, nextPageToken)``.
function list(limit, token, cb) {
    const q = ds.createQuery([kind])
        .limit(limit)
        .order('title')
        .start(token);

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        cb(null, entities.map(fromDatastore), hasMore);
    });
}

// Creates a new book or updates an existing book with new data. The provided
// data is automatically translated into Datastore format. The book will be
// queued for background processing.
function update(id, data, cb) {
    let key;
    if (id) {
        key = ds.key([kind, parseInt(id, 10)]);
    } else {
        key = ds.key(kind);
    }

    const entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };

    ds.save(
        entity,
        (err) => {
            data.id = entity.key.id;
            cb(err, err ? null : data);
        }
    );
}

function create(data, cb) {
    update(null, data, cb);
}

function read(id, cb) {
    const key = ds.key([kind, parseInt(id, 10)]);
    ds.get(key, (err, entity) => {
        if (!err && !entity) {
            err = {
                code: 404,
                message: 'Not found'
            };
        }
        if (err) {
            cb(err);
            return;
        }
        cb(null, fromDatastore(entity));
    });
}

function _delete(id, cb) {
    const key = ds.key([kind, parseInt(id, 10)]);
    ds.delete(key, cb);
}

module.exports = {
    create,
    read,
    update,
    delete: _delete,
    list
};