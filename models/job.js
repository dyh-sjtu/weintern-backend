var mongoose = require('mongoose');
var JobSchema = require('../schemas/job');
var Job = mongoose.model('Job', JobSchema);
module.exports = Job;
