'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
    
// Schema
var ImageSchema = new Schema({
  path : String,
  tags : Array
});

mongoose.model('Img', ImageSchema);
