'use strict';

function Helpers() {}

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

Helpers.prototype.findRandomImages = function(tags, limit, callback) {
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
		that.update(Img, that.createQueryFromRecordsArrayById(images), {lastUsed: Date.now()}, {multi: true});
	}

	function fillUpRemainingImages(imagesSoFar, diff, callback) {
		var ids = that.getArrayOfIdsFromArrayOfRecords(imagesSoFar);

		that.find(Img, {'_id' : {$nin: ids}}, diff, function(err, images) {
			if ( err ) {} // handle err here

			callback(null, images);
		});
	}
	
	that.find(Img, query, limit, function(err, images) {
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






var mongoose = require('mongoose'),
    Img   = mongoose.model('Img'),
    async = require('async'),
    fs    = require('fs'),
    path  = require('path'),
    Helper = new Helpers();

/**
 * Return an array of Img Objects
 *
 * @return Array
 */
exports.get_images = function(req, res) {
	var tags, limit = 5;

	// Set limit to what is passed in the query string param
	if ( undefined !== req.query['limit'] ) {
		// If the limit passed is a number, use it.
		if ( req.query['limit'] >= 0 ) {
			limit = req.query['limit'];
		}
	}

	Helper.findRandomImages(req.query['tags'], limit, function(err, images) {
		if ( err ) {
			// do stuff if err
		}

		return res.json(Helper.shuffle(images));
	});
}

/**
 * Add an image to the images directory and a reference in the DB
 *
 * @return Object
 */
exports.post_images = function(req, res) {
	if ( undefined === req.body.files ) return res.send({err: 'Missing required field in req {files}.'});
	if ( undefined === req.body.tags ) return res.send({err: 'Missing required field in post body {tags}'});

	var files   	  = req.body.files,
		tags          = req.body.tags,
		publicDirName = 'images/slides',
		fileExt       = Helper.getExtension(files.imageUpload.name),
	  	fileName      = (Date.now() + Math.random()) + "." + fileExt,
	  	newPath       = __dirname + "/../../app/" + publicDirName + "/" + fileName,
	  	newImgAddedToImg;

	// Read the file so we can access the data on it fo saving purposes
	fs.readFile(files.imageUpload.path, function (err, data) {
	  if ( err ) {
	  	// Add some validation that it failed here
	  	return res.send(err);
	  }

	  // Add file to directory
	  fs.writeFile(newPath, data, function (err) {
	  	if ( err ) {
	  		console.log(err);
	  		return res.send(err);
	  	}

	  	// Make all lower case first
	  	tags = tags.toLowerCase();

	  	// Set some properties of the image we are saving
	  	newImgAddedToImg = {
	  		path: '/' + publicDirName + '/' + fileName,
	  		tags: tags.split(',')
	  	};

	  	// Add Img object to DB
	  	Img.create(newImgAddedToImg, function(err, newImg) {
	  		if ( err ) {
	  			// Some error handling perhaps?
	  			return res.send(err);
	  		}

	  		console.log('Image Uploaded.');
	  		return res.json(newImg);
	  	});
	  });
	});
}
