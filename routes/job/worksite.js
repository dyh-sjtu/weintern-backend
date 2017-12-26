let Worksite = require('../../models/salary');
let express = require('express');
let router = express.Router();
let Job = require('../../models/job');

// 用户首先需要登录权限的中间件
let {requiredLogin, requiredAdmin} = require('../middleware/auth');
router.use(requiredLogin);

// 获取薪资录入页
router.get('/weintern/job/worksite/new', requiredAdmin, (req, res) => {
	res.render('worksiteAdd', {
		title: '工作地点分类录入页',
		worksite: {},
	})
});

// 保存工作地点
router.post('/weintern/job/worksite/save', requiredAdmin, (req, res) => {
	let worksiteObj = req.body.worksite;
	let id = worksiteObj._id;
	let addr = worksiteObj.addr;
	if (id) {
		Worksite.findById(id, (err, worksite) => {
			worksite.addr = addr;
			worksite.save((err, worksite) => {
				if (err) {
					console.log(err)
				}
				res.redirect('/weintern/job/worksite/list');
			})
		})
	} else {
		let worksite = new Worksite(worksiteObj);
		worksite.save((err, worksite) => {
			if (err) {
				console.log(err)
			}
			res.redirect('/weintern/job/worksite/list');
		})
	}
});

// 工作地点列表页
router.get('/weintern/job/worksite/list', requiredAdmin, (req, res) => {
	Worksite.fetch((err, worksites) => {
		if (err) {
			console.log(err)
		} else {
			res.render('salaryList', {
				title: '薪资分类列表页',
				worksites: worksites
			})
		}
	})
});

// 工作地点更新页
router.get('/weintern/job/worksite/update/:id', requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Worksite.findById(id, (err, worksite) => {
			console.log(worksite);
			res.render('worksiteAdd', {
				title: '行业类别更新页 > ' + worksite.addr,
				worksite: worksite
			})
		})
	}
});

// 工作地点删除
router.delete('/weintern/job/worksite/del', requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Job.find({worksite: id}, (err, jobs) => {
			console.log(jobs);
			jobs.forEach((ele, index) => {
				ele.remove();
			})
		});
		
		Worksite.remove({_id: id}, (err, worksite) => {
			if (err) {
				console.log(err)
			} else {
				res.json({success: 1});
			}
		})
	}
});

module.exports = router;


