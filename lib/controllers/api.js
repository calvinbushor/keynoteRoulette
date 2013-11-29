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

/**
 * Return an array of Img Objects
 *
 * @return Array
 */
exports.get_images = function(req, res) {
	var query = req.query;
	console.log(query);

	// Person
	// 	.find({ occupation: /host/ })
	// 	.where('name.last').equals('Ghost')
	// 	.where('age').gt(17).lt(66)
	// 	.where('likes').in(['vaporizing', 'talking'])
	// 	.limit(10)
	// 	.sort('-occupation')
	// 	.select('name occupation')
	// 	.exec(callback);

	return Img.find(function (err, images) {
	    if (!err) {
	      	return res.json(images);
	    } else {
	      	return res.send(err);
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
