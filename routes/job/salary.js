let Salary = require('../../models/salary');
let express = require('express');
let router = express.Router();
let Job = require('../../models/job');

// 用户首先需要登录权限的中间件
let {requiredLogin, requiredAdmin} = require('../middleware/auth');
router.use(requiredLogin);

// 获取薪资录入页
router.get('/weintern/job/salary/new', requiredAdmin, (req, res) => {
	res.render('salaryAdd', {
		title: '薪资分类录入页',
		salary: {},
	})
});

// 保存薪资类别
router.post('/weintern/job/salary/save', requiredAdmin, (req, res) => {
	let salaryObj = req.body.salary;
	let id = salaryObj._id;
	let value = salaryObj.value;
	if (id) {
		Salary.findById(id, (err, salary) => {
			salary.value = value;
			salary.save((err, salary) => {
				if (err) {
					console.log(err)
				}
				res.redirect('/weintern/job/salary/list');
			})
		})
	} else {
		let salary = new Salary(salaryObj);
		salary.save((err, salary) => {
			if (err) {
				console.log(err)
			}
			res.redirect('/weintern/job/salary/list');
		})
	}
});

// 薪资类别列表页
router.get('/weintern/job/salary/list', requiredAdmin, (req, res) => {
	Salary.fetch((err, salaries) => {
		if (err) {
			console.log(err)
		} else {
			res.render('salaryList', {
				title: '薪资分类列表页',
				salaries: salaries
			})
		}
	})
});

// 薪资类别更新页
router.get('/weintern/job/salary/update/:id', requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Salary.findById(id, (err, salary) => {
			console.log(salary);
			res.render('salaryAdd', {
				title: '行业类别更新页 > ' + salary.value,
				salary: salary
			})
		})
	}
});

// 行业类别删除
router.delete('/weintern/job/salary/del', requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Job.find({salary: id}, (err, jobs) => {
			console.log(jobs);
			jobs.forEach((ele, index) => {
				ele.remove();
			})
		});
		
		Salary.remove({_id: id}, (err, salary) => {
			if (err) {
				console.log(err)
			} else {
				res.json({success: 1});
			}
		})
	}
});

module.exports = router;


