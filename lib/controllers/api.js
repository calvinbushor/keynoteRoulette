'use strict';

var mongoose = require('mongoose'),
    Img   = mongoose.model('Img'),
    async = require('async'),
    fs    = require('fs'),
    path  = require('path'),
    Helpers = require('../helpers.js');

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

	// Set limit to what is passed in the query string param
	if ( undefined !== req.query['limit'] ) {
		// If the limit passed is a number, use it.
		if ( req.query['limit'] >= 0 ) {
			limit = req.query['limit'];
		}
	}

	// We want images which have not been used latly
	if ( 'true' == req.query['newest'] ) {
		Helpers.findNotUsedLatlyImages(Img, req.query['tags'], limit, function(err, images) {
			if ( err ) {} // handle err here

			return res.json(Helpers.shuffle(images));
		});
	} else {
		console.log(limit);
		Helpers.findImagesUpToLimit(Img, query, limit, function(err, images) {
			if ( err ) {} // handle err here

			return res.json(Helpers.shuffle(images));
		});
	}
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
		fileExt       = Helpers.getExtension(files.imageUpload.name),
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
