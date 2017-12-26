let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Comment = require('../../models/comment');
let Category = require('../../models/category');
let Salary = require('../../models/salary');
let Worksite = require('../../models/worksite');

// 权限中间件
let {requiredLogin, requiredAdmin} = require('../middleware/auth');
// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
router.use(requiredLogin);

// 挂载至 /xx/xx的中间件，任何指向 /xx/xx 的请求都会执行它
// 获得实习岗位列表
router.get('/weintern/job/list', requiredAdmin, (req, res) => {
	// console.log(res.locals.job)
	Job.find({},(err, jobs) => {
			if (err) {
				console.log(err)
			} else {
				res.render('jobList', {
					title: '实习岗位列表',
					jobs: jobs
				})
			}
		})
});

// 实习岗位录入页
router.get('/weintern/job/add', requiredAdmin, (req, res) => {
	Category.find({}, (err, categories) => {
		Salary.find({}, (err, salaries) => {
			Worksite.find({}, (err, worksites) => {
				res.render('jobAdd', {
					title: '实习录入页',
					categories: categories,
					salaries: salaries,
					worksites: worksites,
					job: {
						jobname: '',
						desc: '',
						jobcontent: [],
						skill: [],
						resumeAddr: '',
						note: ''
					}
				})
			})
		});
	})
});

// 更新实习岗位
router.get('/weintern/job/update/:id', requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Job.findById(id, (err, job) => {
			Category.find({}, (err, categories) => {
				res.render('movieAdmin', {
					title: '更新页 >' + job.jobname,
					job: job,
					categories: categories
				})
			})
		})
	}
})

// 保存实习岗位
router.post('/weintern/job/new', requiredAdmin, (req, res) => {
	let id = req.body.job._id;
	let jobObj = req.body.job;
	let _job;
	if (id) {
		// console.log("更新");
		Job.findById(id, (err, job) => {
			if (err) {
				console.log(err)
			}
			_job = Object.assign(job, jobObj);
			_job.save((err, job) => {
				if (err) {
					console.log(err)
				}
				// 添加
				Category.findById(job.category, (err, category) => {
					if (category.jobs.indexOf(job._id) > -1) {
						return
					} else {
						category.jobs.push(job._id);
					}
					category.save((err, category) => {
						if (err) {
							console.log(err);
						}
					});
					// 删除
					Category.findOne({"jobs": job._id}, (err, category) => {
						if (category.jobs.length > 0) {
							category.jobs.forEach((e, i) => {
								if (e.toString() === job._id.toString()) {
									category.jobs.splice(i, 1)
								}
							});
							category.save((err, category) => {
								if (err) {
									console.log(err);
								} else {
									console.log("保存成功");
								}
							})
						}
					})
				});
				res.redirect('/');
			})
		})
	} else {
		_job = new Job(jobObj);
		let categoryId = jobObj.category;
		let categoryName = jobObj.categoryName;
		if (categoryId || categoryName) {
			_job.save((err, job) => {
				if (err) {
					console.log(err)
				}
				if (categoryId) {
					Category.findById(categoryId, (err, category) => {
						category.jobs.push(_job.id);
						category.save((err, category) => {
							if (err) {
								console.log(err)
							}
							res.redirect('/weintern/job/' + movie._id)
						})
					})
				} else if (categoryName) {
					let category = new Category({
						name: categoryName,
						jobs: [movie._id]
					});
					category.save((err, category) => {
						job.category = category._id;
						job.save((err, movie) => {
							res.redirect('/weintern/job/' + job._id);
						})
					})
				}
			})
		} else {
			let msg = "请选择电影分类！";
			res.redirect(`/weintern/status?return_url=/weintern/job/add&code=0&tips=${msg}`);
		}
	}
});

// 删除实习岗位
router.delete('/weintern/job/list', requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Category.findOne({"jobs": id}, (err, category) => {
			let index = category.jobs.indexOf(id);
			category.jobs.splice(index, 1);
			category.save((err, category) => {
				if (err) console.log(err);
			})
		});
		Job.remove({_id: id}, (err, movie) => {
			if (err) {
				console.log(err)
			} else {
				res.json({success: 1})
			}
		})
	}
})

// 保存对该实习岗位的评价
router.post('/weintern/job/comment', (req, res) => {
	// ajax提交评论直接评论已经实现，对评论人的评论暂未实现
	let _comment = req.body.comment;
	let comment = new Comment(_comment);
	let jobId = _comment.job;
	console.log(_comment);
	if (_comment.cid) {
		Comment.findById(_comment.cid, (err, comment) => {
			let reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content
			};
			
			comment.reply.push(reply);
			console.log(comment);
			comment.save((err, comment) => {
				if (err) {
					console.log(err)
				} else {
					console.log("回复评论人", comment);
					res.redirect("/weintern/job/" + movieId)
				}
			})
		})
	} else {
		comment.save((err, comment) => {
			if (err) {
				console.log(err)
			} else {
				console.log("直接评论", comment)
				// Comment.find({content: content})
				// .populate("from","name")
				// .exec((err, comments) => {
				//     res.send(comments)
				// })
				res.redirect("/weintern/job/" + jobId)
			}
		})
	}
});

module.exports = router;