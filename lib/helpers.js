/**
 * @constructor
 */
function Helpers() {
	this.foo = 'bar';
}

Helpers.prototype.shuffle = function(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
 	return o;
}

// Get the file extension from the file name
Helpers.prototype.getExtension = function(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

Helpers.prototype.update = function(Model, query, updater, options) {
	if ( undefined === query || 
		 undefined === updater || 
		 undefined === options ) {

		throw new Error('Why you no pass required params {query}, {updater}, {options}?');
	}

	// Your execution of updating records
	Model.update(query, updater, options, function(err, result) {
		console.log('Finished updating ' + result + ' records.');
	});
}

Helpers.prototype.find = function(Model, query, limit, callback) {
	// Find us some things represented in Model
	Model.find(query)
		.limit(limit) // Set to 0 removes any limiting
	    .exec(function(err, images) {
	    	if ( err ) {} // handle err here

	    	callback(null, images);
	    });
}

Helpers.prototype.getArrayOfIdsFromArrayOfRecords = function(records) {
	var ids = [];

	for ( var record in records ) {
		ids.push(records[record]['_id']);
	}

	return ids;
}

Helpers.prototype.createQueryFromRecordsArrayById = function(records) {
	var that  = this,
		query = {
		'_id': { $in: that.getArrayOfIdsFromArrayOfRecords(records)}
	};

	return query;
}

Helpers.prototype.findNotUsedLatlyImages = function(Model, tags, limit, callback) {
	var result, 
		total,
		randomImages = [],
		that = this,
		delta = (5 * 60000), // min * 1 min in ms = time to subtract from current time in ms
		query = {
			tags: { $all: [''] },
			lastUsed: {$lt: (Date.now() - delta) }
		};

	// update tags property on the query object so we can search by tag
	if ( undefined !== tags ) {
		tags = tags.split(',');

		query['tags']['$all'] = tags;
	} else {
		delete query['tags'];
	}

	function updateLastUsed(images) {
		that.update(Model, that.createQueryFromRecordsArrayById(images), {lastUsed: Date.now()}, {multi: true});
	}

	function fillUpRemainingImages(imagesSoFar, diff, callback) {
		var ids = that.getArrayOfIdsFromArrayOfRecords(imagesSoFar);

		that.find(Model, {'_id' : {$nin: ids}}, diff, function(err, images) {
			if ( err ) {} // handle err here

			callback(null, images);
		});
	}
	
	that.find(Model, query, limit, function(err, images) {
		if ( err ) {} // handle err here

		// Merge the image array we already have
		randomImages = randomImages.concat(images);

		// Check if we have found enough images
		if ( randomImages.length < limit ) {
			var diff = limit - randomImages.length;

			// We need more
			fillUpRemainingImages(randomImages, diff, function(err, moreImages) {
				randomImages = randomImages.concat(moreImages);
				updateLastUsed(randomImages);
				callback(null, randomImages);
			});
		} else {
			// We have enough
			updateLastUsed(randomImages);
			callback(null, randomImages);
		}
	});
}

Helpers.prototype.findImagesUpToLimit = function(Model, query, limit, callback) {
	var that = this;

	// Check if we have found enough images
	that.find(Model, query, limit, function(err, images) {
		if ( err ) {} // handle err here

		// Fill up with more images if less than limit
    	if ( limit > images.length ) {
    		var diff = (images.length - limit),
    			ids  = [];

    		// create list of ids to check against
    		for ( var image in images ) {
    			ids.push(images[image]['_id']);
    		}

    		// Find more images but not ones which match the first groups ids
    		that.find(Model, {_id: {$nin: ids}}, 0, function(err, moreImages) {
    			if ( err ) {} // handle err here

    			// Merge the two lists of images
		    	images = images.concat(moreImages);

		    	return callback(null, images);
    		});
    	} else {
    		return callback(null, images);
    	}
	});
}

module.exports = new Helpers();