'use strict';

var mongoose = require('mongoose'),
    Thing    = mongoose.model('Thing'),
    Img      = mongoose.model('Img'),
    async    = require('async'),
    request  = require('request'),
    fs       = require('fs');

exports.post_images = function(req, res) {
	var options = {
		url    : 'http://localhost:8000/api/images',
		method : 'post',
		json   : true,
		form   : {
			files : req.files,
			tags  : req.body.tags
		}
	};

	// Utilize the API for adding images
	request(options, function(err, response, body) {
		// Some error handling perhaps
		if ( err ) {
			console.log(err);
			res.redirect('back');
			return;
		}

		// Just reload the page for now
		res.redirect('back');
	});
}
