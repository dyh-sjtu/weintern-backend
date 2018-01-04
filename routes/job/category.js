let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Category = require('../../models/category');

// 权限中间件
let Auth = require('../middleware/auth');


// 行业类别录入页
// 挂载至 /xx/xx的中间件，任何指向 /xx/xx 的请求都会执行它
router.get('/weintern/job/category/add',Auth.requiredLogin, Auth.requiredAdmin, (req, res) => {
	res.render('categoryAdd', {
		title: '行业分类录入',
		category: {},
	})
});

// 保存行业类别
router.post('/weintern/job/category/save',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	let categoryObj = req.body.category;
	let id = categoryObj._id;
	let name = categoryObj.name;
	if (id) {
		Category.findById(id, (err, category) => {
			category.name = name;
			category.save((err, category) => {
				if (err) {
					console.log(err)
				}
				res.redirect('/weintern/job/category/list');
			})
		})
	} else {
		let category = new Category(categoryObj);
		category.save((err, category) => {
			if (err) {
				console.log(err)
			}
			res.redirect('/weintern/job/category/list');
		})
	}
});

// 行业类别列表页
router.get('/weintern/job/category/list',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	Category.fetch((err, categories) => {
		if (err) {
			console.log(err)
		} else {
			res.render('categoryList', {
				title: '行业分类列表',
				categories: categories
			})
		}
	})
});

// 行业类别更新页
router.get('/weintern/job/category/update/:id',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Category.findById(id, (err, category) => {
			console.log(category);
			res.render('categoryAdd', {
				title: '行业类别更新 > ' + category.name,
				category: category
			})
		})
	}
});

// 行业类别删除
router.delete('/weintern/job/category/del',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Job.find({category: id}, (err, jobs) => {
			console.log(jobs);
			jobs.forEach((ele, index) => {
				ele.remove();
			})
		});
		
		Category.remove({_id: id}, (err, category) => {
			if (err) {
				console.log(err)
			} else {
				res.json({success: 1});
			}
		})
	}
});

module.exports = router;