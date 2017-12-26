var mongoose = require('mongoose');
var WorksiteSchema = require('../schemas/worksite');
var Worksite = mongoose.model('Worksite', WorksiteSchema);
module.exports = Worksite;