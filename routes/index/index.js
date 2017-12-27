let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Comment = require('../../models/comment');
let Category = require('../../models/category');
let Worksite = require('../../models/worksite');

// 首页
router.get('/', (req, res) => {
	Category.find({}).limit(5)
		.populate({path: "jobs", options: {limit: 5}})
		.exec((err, categories) => {
			if (err) {
				console.log(err)
			} else {
				// console.log("categories",categories)
				res.render('index', {
					title: '首页',
					categories: categories
				})
			}
		})
});

// 岗位详情
router.get('/weintern/job/detail/:id', (req, res) => {
	let id = req.params.id;
	Job.update({_id: id}, {'$inc': {'pv': 1}}, (err) => {
		if (err) console.log(err);
	});
	Job.findById(id, (err, job) => {
		Comment.find({job: id})
			.populate("from", "name img")
			.populate("reply.from reply.to", "name img")
			.exec((err, comments) => {
				console.log("comments", comments)
				res.render('jobDetail', {
					title: '详情页 ',
					job: job,
					comments: comments
				});
			})
	})
});

// 单个分类下的岗位列表
router.get('/weintern/job/category/result', (req, res) => {
	let size = 4; // 一页8个
	let categoryId = req.query.cat;
	let pageSize = parseInt(req.query.pageSize);
	let totalSize = 0; // 一共有多少数据；   
	res.locals.categoryId = categoryId;
	Category.findById(categoryId, (err, category) => {
		totalSize = category.jobs.length;
		let page = Math.ceil(totalSize/size); //分多少页
		Category.find({_id: categoryId})
			.populate({path: "jobs", options: {limit: size, skip: (pageSize - 1) * size}})
			.exec((err, categoris) => {
				// console.log(categoris)
				if (err) console.log(err);
				res.render('categoryResult', {
					title: '当前行业类别',
					categoris: categoris,
					page: page,
					categoryId: categoryId,
					pageSize: pageSize,
				})
			})
		
	})
});

// 实习搜索页面
router.post('/weintern/search', (req, res) => {
	// let pageSize = req.query.pageSize;
	let q = req.body.query;
	let reg = new RegExp(q + '.*', 'i');
	let totalSize = 0;
	Job.find({jobname: reg}, (err, jobs) => {
		if (jobs.length <= 0) {  // 如果关键字搜索不到，改用行业类别搜
			Category.find({name: reg}).populate("jobs", "jobname").exec((err, categories) => {
				categories.forEach((item, index) => {
					// console.log(ele.movies.length)
					totalSize += item.jobs.length;
				});
				res.render('search', {
					title: '搜索页',
					categories: categories,
					number: totalSize,
					keywords: q,
				})
			})
		} else {
			res.render('search', {
				title: '搜索页',
				jobs: jobs,
				number: jobs.length,
				keywords: q
			})
		}
	})
	
});

module.exports = router;