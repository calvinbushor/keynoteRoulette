'use strict';

var mongoose = require('mongoose'),
    Img   = mongoose.model('Img'),
    async = require('async'),
    fs    = require('fs'),
    path  = require('path');

// Get the file extension from the file name
function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function Shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

/**
 * Return an array of Img Objects
 *
 * @return Array
 */
exports.get_images = function(req, res) {
	var tags, limit = 5, query = {
		tags: {
			$all:  ['']
		}
	};

	// update tags property on the query object
	if ( undefined !== req.query['tags'] ) {
		tags = req.query['tags'].split(',');

		query['tags']['$all'] = tags;
	} else {
		delete query['tags'];
	}

	// Set limit to what is passed in the query string param
	if ( undefined !== req.query['limit'] ) {
		// If the limit passed is a number, use it.
		if ( req.query['limit'] >= 0 ) {
			limit = req.query['limit'];
		}
	}

	// Find images by tags passed
	Img.find(query)
	    .limit(limit) // Set to 0 removes any limiting
	    .exec(function(err, images) {
	    	if ( err ) {
	    		return res.send(err);
	    	}

	    	// Fill up with more images if less than 5
	    	if ( limit > images.length ) {
	    		var diff = (images.length - limit),
	    			ids  = [];

	    		// create list of ids to check against
	    		for ( var image in images ) {
	    			ids.push(images[image]['_id']);
	    		}

	    		Img.find({_id: {$nin: ids}})
	    			.limit(diff)
	    			.exec(function(err, moreImages) {
	    				if ( err ) {
				    		return res.send(err);
				    	}

				    	// Merge the two lists of images
				    	images = images.concat(moreImages);

				    	return res.json(Shuffle(images));
	    			});
	    	} else {
	    		return res.json(Shuffle(images));
	    	}
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
		fileExt       = getExtension(files.imageUpload.name),
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
