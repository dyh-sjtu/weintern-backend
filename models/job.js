let mongoose = require('mongoose');
let JobSchema = require('../schemas/job');
let Job = mongoose.model('Job', JobSchema);
module.exports = Job;
