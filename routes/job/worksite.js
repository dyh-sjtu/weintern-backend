let Worksite = require('../../models/worksite');
let express = require('express');
let router = express.Router();
let Job = require('../../models/job');

// 用户首先需要登录权限的中间件
let Auth = require('../middleware/auth');
router.use(Auth.requiredLogin);

// 获取薪资录入页
router.get('/weintern/job/worksite/add', Auth.requiredAdmin, (req, res) => {
	res.render('worksiteAdd', {
		title: '地点分类录入',
		worksiteArr: ['上海', '苏州', '南京', '杭州', '无锡', '广州', '北京', '武汉', '重庆'],
		worksite: {},
	})
});

// 保存工作地点
router.post('/weintern/job/worksite/save', Auth.requiredAdmin, (req, res) => {
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
router.get('/weintern/job/worksite/list', Auth.requiredAdmin, (req, res) => {
	Worksite.fetch((err, worksites) => {
		if (err) {
			console.log(err)
		} else {
			res.render('worksiteList', {
				title: '地点分类列表',
				worksites: worksites
			})
		}
	})
});

// 工作地点更新页
router.get('/weintern/job/worksite/update/:id', Auth.requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Worksite.findById(id, (err, worksite) => {
			console.log(worksite);
			res.render('worksiteAdd', {
				title: '地点更新 > ' + worksite.addr,
				worksiteArr: ['上海', '苏州', '南京', '杭州', '无锡', '广州', '北京', '武汉', '重庆'],
				worksite: worksite
			})
		})
	}
});

// 工作地点删除
router.delete('/weintern/job/worksite/del', Auth.requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Job.find({worksite: id}, (err, jobs) => {  // 当删除某个工作地点类别时，应该删除该地点下的所有岗位
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


