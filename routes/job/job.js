let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Comment = require('../../models/comment');
let Category = require('../../models/category');
let Worksite = require('../../models/worksite');
let SaveFile = require('../middleware/upload');
// 权限中间件
let Auth = require('../middleware/auth');

// 挂载至 /xx/xx的中间件，任何指向 /xx/xx 的请求都会执行它
// 获得实习岗位列表
router.get('/weintern/job/list', Auth.requiredLogin, Auth.requiredAdmin, (req, res) => {
	Job.find({})
		.populate("category", "name")
		.populate("worksite", "addr")
		.exec((err, jobs) => {
			if (err) {
				console.log(err)
			}else {
				res.render('jobList', {
					title: '实习岗位列表',
					jobs: jobs,
				})
			}
		})
});

// 实习岗位录入页
router.get('/weintern/job/add',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	Category.find({}, (err, categories) => {
		Worksite.find({}, (err, worksites) => {
			res.render('jobAdd', {
				title: '实习岗位录入页',
				categories: categories,
				worksites: worksites,
				job: {
					jobname: '',
					company: '',
					companyUrl: '',
					companyAddr: '',
					salary: '100-200',
					desc: '',
					jobcontent: '',
					skill: '',
					internWeek: '3', // 默认为3天/周
					interMonth: '3-6',   // 默认为3-6个月
					note: '',
					education: '本科',
					email: '',
					canBeRegular: '不详',
					welfare: '',
					deadline: parseInt(Date.now()) + 3*30 * 24 * 60 * 60 * 1000 // 默认截止时间为当前时间的三个月之后
				}
			})
		})
	})
});

// 更新实习岗位
router.get('/weintern/job/update/:id',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Job.findById(id, (err, job) => {
			job.jobcontent = job.jobcontent.join("||");
			job.skill = job.skill.join("||");
			Category.find({}, (err, categories) => {
				Worksite.find({}, (err, worksites) => {
					res.render('jobAdd', {
						title: '岗位更新页 >' + job.jobname,
						job: job,
						categories: categories,
						worksites: worksites
					})
				})
			})
		})
	}
})

// 保存实习岗位
router.post('/weintern/job/save',Auth.requiredLogin,  Auth.requiredAdmin, SaveFile.saveFile, (req, res) => {
	let id = req.body.job._id;
	req.body.job.jobcontent = req.body.job.jobcontent.split('||');
	req.body.job.jobcontent.filter((item) => {
		return item.trim().length > 0
	});
	req.body.job.skill = req.body.job.skill.split('||');
	req.body.job.skill.filter((item) => {
		return item.trim().length > 0
	});
	let jobObj = req.body.job;
	let _job;
	
	if (req.image) {
		jobObj.image = req.image;
	}
	
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
				// 更新行业类别下的岗位
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
					// 删除当前行业类别下的岗位
					Category.findOne({"jobs": id}, (err, category) => {
						if (category.jobs && category.jobs.length > 0) {
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
				// 更新地点类别下的岗位
				Worksite.findById(job.worksite, (err, worksite) => {
					if (worksite.jobs.indexOf(job._id) > -1) {
						return
					} else {
						worksite.jobs.push(job._id);
					}
					worksite.save((err, worksite) => {
						if (err) {
							console.log(err);
						}
					});
					// 删除当前地点类别下的岗位
					Worksite.findOne({"jobs": job._id}, (err, worksite) => {
						if (worksite.jobs.length > 0) {
							worksite.jobs.forEach((e, i) => {
								if (e.toString() === job._id.toString()) {
									worksite.jobs.splice(i, 1)
								}
							});
							worksite.save((err, worksite) => {
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
		let worksiteId = jobObj.worksite;
		let categoryId = jobObj.category;
		if (worksiteId && categoryId) {
			_job.save((err, job) => {
				if (err) {
					console.log(err)
				}
				// 保存行业类别下的岗位
				Category.findById(categoryId, (err, category) => {
					category.jobs.push(_job.id);
					category.save((err, category) => {
						if (err) {
							console.log(err)
						}
					})
				})
				// 保存工作地点类别下的岗位
				Worksite.findById(worksiteId, (err, worksite) => {
					worksite.jobs.push(_job.id);
					worksite.save((err, worksite) => {
						if (err) {
							console.log(err)
						}
						res.redirect('/weintern/job/detail/' + job._id)
					})
				})
			})
		}
		else {
			let msg = "请选择岗位分类！";
			res.redirect(`/weintern/status?return_url=/weintern/job/add&code=0&tips=${msg}`);
		}
	}
});

// 删除实习岗位
router.delete('/weintern/job/list/del',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Category.findOne({"jobs": id}, (err, category) => {
			let index = category.jobs.indexOf(id);
			category.jobs.splice(index, 1);
			category.save((err, category) => {
				if (err) console.log(err);
			})
		});
		Worksite.findOne({"jobs": id}, (err, worksite) => {
			let index = worksite.jobs.indexOf(id);
			worksite.jobs.splice(index, 1);
			worksite.save((err, worksite) => {
				if (err) console.log(err);
			})
		});
		Job.remove({_id: id}, (err, job) => {
			if (err) {
				console.log(err)
			} else {
				res.json({success: 1})
			}
		})
	}
})

// 保存对该实习岗位的评价
router.post('/weintern/job/comment', Auth.requiredLogin, (req, res) => {
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
					res.redirect("/weintern/job/detail/" + jobId)
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
				res.redirect("/weintern/job/detail/" + jobId)
			}
		})
	}
});

module.exports = router;