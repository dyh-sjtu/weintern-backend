var mongoose = require('mongoose');
var SalarySchema = require('../schemas/salary');
var Salary = mongoose.model('Salary', SalarySchema);
module.exports = Salary;