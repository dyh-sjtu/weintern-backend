let mongoose = require('mongoose');
let WorksiteSchema = require('../schemas/worksite');
let Worksite = mongoose.model('Worksite', WorksiteSchema);
module.exports = Worksite;