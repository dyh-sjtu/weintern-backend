let express = require('express');
let router = express.Router();
let crypto = require('crypto');
let config = require('../../config/config');
let Category = require('../../models/category');
let Job = require('../../models/job');

router.get('/', (req, res) => {
	let echostr, nonce, signature, timestamp;
	signature = req.query.signature.toString();
	timestamp = req.query.timestamp.toString();
	nonce = req.query.nonce.toString();
	echostr = req.query.echostr.toString();
	if (checkToken(timestamp, nonce, signature, config.wechat.token.toString())) {
		console.log("比对成功");
		return res.send(echostr);
	} else {
		console.log('比对失败');
		return res.end();
	}
});

// 查询所有岗位类别
router.get('/job/categories', (req, res) => {
	Category.find({})
		.sort({"meta.createAt": 1}) // 种类按升序排序，录入越早越在前面
		.exec((err, categories) => {
			if (err) {
				return res.json({
					success: 0,
					data: {}
				})
			}
			return res.json({
				success: 1,
				data: categories
			});
		})
});

// 首页查询所有岗位
router.get('/jobs', (req, res) => {
	let start = parseInt(req.query.start);
	let count = parseInt(req.query.count);
	Job.find({})
		.populate('worksite', "addr")
		.populate('category', 'name')
		.sort({"meta.updateAt": -1})  // 按照岗位的更新时间降序排序
		.skip(start)
		.limit(count)
		.exec((err, jobs) => {
			if (err) {
				return res.json({
					success: 0,
					data: {}
				})
			}
			console.log(jobs.length);
			return res.json({
				success: 1,
				data: jobs
			})
		})
});

// 根据jobID查找岗位详情
router.get('/job', (req, res) => {
	let jobId = req.query.jobId;
	Job.find({_id: jobId})
		.populate('worksite', 'addr')
		.populate('category', 'name')
		.exec((err, job) => {
			if (err) {
				res.json({
					success: 0,
					data: {}
				})
			}
			res.json({
				success: 1,
				data: job
			})
		})
})


// 根据类别ID查找该类别下的所有职位
router.get('/job/category', (req, res) => {
	let start = parseInt(req.query.start);
	let count = parseInt(req.query.count);
	let categoryId = req.query.categoryId;
	Job.find({category: categoryId})
		.populate('worksite', 'addr')
		.populate('category', 'name')
		.sort({"meta.updateAt": -1})  	// 按照岗位的更新时间降序排序
		.skip(start)
		.limit(count)
		.exec((err, jobs) => {
			if (err) {
				return res.json({
					success: 0,
					data: {}
				})
			}
			return res.json({
				success: 1,
				data: jobs
			})
		})
});

// 根据关键字搜索
router.get('/job/search', (req, res) => {
	let query = req.query.searchType;
	let reg = new RegExp(query + '.*', 'i');
	Job.find({jobname: reg})
		.populate('worksite', 'addr')
		.populate('category', 'name')
		.sort({'meta.updateAt': -1})
		.exec((err, jobs) => {
		if (jobs.length <= 0) {
			Job.find({company: reg})
				.populate('worksite', 'addr')
				.populate('category', 'name')
				.sort({'meta.updateAt': -1})
				.exec((err, _jobs) => {
				if (_jobs.length <= 0) {
					Category.find({name: reg})
						.populate('jobs')
						.sort({'meta.updateAt': -1})
						.exec((err, category) => {
							console.log(category)
							if (err) {
								return res.json({
									success: 0,
									data: {}
								})
							}
							return res.json({
								success: 1,
								data: category.jobs
							})
						})
				} else {
					if (err) {
						return res.json({
							success: 0,
							data: {}
						})
					}
					console.log(_jobs)
					return res.json({
						success: 1,
						data: _jobs
					})
				}
			})
		} else {
			if (err) {
				return res.json({
					success: 0,
					data: {}
				})
			}
			console.log(jobs)
			return res.json({
				success: 1,
				data: jobs
			})
		}
	})
});


function checkToken(timestamp, nonce, signature, token) {
	let currSign, tmp;
	tmp = [token, timestamp, nonce];
	tmp.sort();
	let shasum = crypto.createHash('sha1');
	shasum.update(tmp.join('').toString());
	currSign = shasum.digest("hex");
	console.log(currSign);
	console.log(signature);
	return currSign == signature;
}

module.exports = router;
