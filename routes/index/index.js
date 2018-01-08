let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Comment = require('../../models/comment');
let Category = require('../../models/category');
let Worksite = require('../../models/worksite');


// 首页
router.get('/', (req, res) => {
	let type = req.query.type;
	if (type && type == "worksite") {
		Worksite.find({})
			.populate({path: "jobs", options: {limit: 4}})
			.exec((err, worksites) => {
				if (err) {
					console.log(err)
				} else {
					res.render("index", {
						title: "首页",
						worksites: worksites
					})
				}
			})
	} else {
		Category.find({})
			.populate({path: "jobs", options: {limit: 4}})
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
	}
	
});

// 岗位详情
router.get('/weintern/job/detail/:id', (req, res) => {
	let id = req.params.id;
	let localUser = req.session.user;
	Job.update({_id: id}, {'$inc': {'pv': 1}}, (err) => {
		if (err) console.log(err);
	});
	Job.findById(id, (err, job) => {
		Category.findById(job.category, (err, category) => {
			Worksite.findById(job.worksite, (err, worksite) => {
				Comment.find({job: id})
					.populate("from", "name img")
					.populate("reply.from reply.to", "name img")
					.exec((err, comments) => {
						res.render('jobDetail', {
							title: '岗位详情页 ',
							job: job,
							category: category,
							worksite: worksite,
							comments: comments,
							user: localUser
						});
					})
			})
		});
	})
});

// 单个岗位类型分类下的岗位列表
router.get('/weintern/job/category/result', (req, res) => {
	let size = 4; // 一页4个
	let categoryId = req.query.cat;
	let pageSize = parseInt(req.query.pageSize);
	let totalSize = 0; // 一共有多少数据；   
	res.locals.categoryId = categoryId;
	Category.findById(categoryId, (err, category) => {
		totalSize = category.jobs.length;
		let page = Math.ceil(totalSize / size); //分多少页
		Category.find({_id: categoryId})
			.populate({path: "jobs", options: {limit: size, skip: (pageSize - 1) * size}})
			.exec((err, categories) => {
				if (err) {
					console.log(err);
				}
				res.render('categoryResult', {
					title: '当前行业类别',
					categories: categories,
					page: page,
					categoryId: categoryId,
					pageSize: pageSize,
				})
			})
		
	})
});

// 单个地点分类下的岗位列表
router.get('/weintern/job/worksite/result', (req, res) => {
	let size = 4; // 一页4个
	let worksiteId = req.query.site;
	let pageSize = parseInt(req.query.pageSize);
	let totalSize = 0; // 一共有多少数据；
	res.locals.worksiteId = worksiteId;
	Worksite.findById(worksiteId, (err, worksite) => {
		totalSize = worksite.jobs.length;
		console.log(totalSize);
		let page = Math.ceil(totalSize / size); //分多少页
		Worksite.find({_id: worksiteId})
			.populate({path: "jobs", options: {limit: size, skip: (pageSize - 1) * size}})
			.exec((err, worksites) => {
				if (err) {
					console.log(err);
				}
				res.render('worksiteResult', {
					title: '当前工作地点',
					worksites: worksites,
					page: page,
					categoryId: worksiteId,
					pageSize: pageSize,
				})
			})
		
	})
});

// 实习搜索页面
router.get('/weintern/search', (req, res) => {
	let localUser;
	if (req.session.user) {
		localUser = req.session.user;
	}
	let q = req.query.query;
	// let size = 4;
	let reg = new RegExp(q + '.*', 'i');
	let totalSize = 0;
	Job.find({jobname: reg}, (err, jobs) => {
		if (jobs.length <= 0) {  // 如果关键字搜索不到，改用行业类别搜
			Job.find({company: reg}, (err, _jobs) => {
				if (_jobs.length <= 0) {
					Category.find({name: reg}).populate("jobs", "jobname image company salary internWeek interMonth canBeRegular").exec((err, categories) => {
						categories.forEach((item, index) => {
							totalSize += item.jobs.length;
						});
						res.render('search', {
							title: '搜索页',
							categories: categories,
							localUser: localUser,
							number: totalSize,
							// pageSize: Math.ceil(totalSize/size),
							keywords: q,
						})
					})
				} else {
					res.render('search', {
						title: '搜索页',
						localUser: localUser,
						jobs: _jobs,
						number: _jobs.length,
						keywords: q
					})
				}
			});
		} else {
			res.render('search', {
				title: '搜索页',
				jobs: jobs,
				localUser: localUser,
				number: jobs.length,
				keywords: q
			})
		}
	})
	
});

module.exports = router;