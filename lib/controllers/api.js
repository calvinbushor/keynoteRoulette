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
	var files   	  = req.body.files,
		publicDirName = 'images/slides';

	// Read the file so we can access the data on it fo saving purposes
	fs.readFile(files.imageUpload.path, function (err, data) {
	  if ( err ) {
	  	// Add some validation that it failed here
	  	return res.send(err);
	  }

	  var fileExt  = getExtension(files.imageUpload.name),
	  	  fileName = (Date.now() + Math.random()) + "." + fileExt;
	  
	  // Define where the image will live
	  var newPath = __dirname + "/../../app/" + publicDirName + "/" + fileName;

	  // Add file to directory
	  fs.writeFile(newPath, data, function (err) {
	  	if ( err ) {
	  		console.log(err);
	  		return res.send(err);
	  	}

	  	// Set some properties of the image we are saving
	  	var newImgAddedToImg = {
	  		path: '/' + publicDirName + '/' + fileName,
	  		tags: ['made up', 'some tag']
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
