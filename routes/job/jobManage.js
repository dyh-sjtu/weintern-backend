let express = require('express');
let router = express.Router();
let Job = require('../../models/job');
let Comment = require('../../models/comment');
let Category = require('../../models/category');
// 权限中间件
let {requiredLogin, requiredAdmin} = require('../middleware/auth');
// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
router.use(requiredLogin);

// 挂载至 /xx/xx的中间件，任何指向 /xx/xx 的请求都会执行它
// 获得实习岗位列表
router.get('/weintern/job/list', requiredAdmin, (req, res) => {
	// console.log(res.locals.job)
	Movie.find({}).populate("category", "name")
		.exec((err, movies) => {
			if (err) {
				console.log(err)
			} else {
				res.render('jobList', {
					title: '实习岗位列表',
					movies: movies
				})
			}
		})
})

// 实习岗位录入页
router.get('/weintern/job/add', requiredAdmin, (req, res) => {
	Category.find({}, (err, categories) => {
		res.render('movieAdmin', {
			title: '后台录入页',
			categories: categories,
			movie: {
				title: '',
				doctor: '',
				country: '',
				year: '',
				poster: '',
				flash: '',
				summary: '',
				language: ''
			}
		})
	})
});

// 更新实习岗位
router.get('/weintern/job/update/:id', requiredAdmin, (req, res) => {
	let id = req.params.id;
	if (id) {
		Movie.findById(id, (err, movie) => {
			Category.find({}, (err, categories) => {
				res.render('movieAdmin', {
					title: '更新页 >' + movie.title,
					movie: movie,
					categories: categories
				})
			})
		})
	}
})

// 保存实习岗位
router.post('/weintern/job/new', requiredAdmin, (req, res) => {
	let id = req.body.movie._id;
	let movieObj = req.body.movie;
	let _movie;
	if (id) {
		// console.log("更新");
		Movie.findById(id, (err, movie) => {
			if (err) {
				console.log(err)
			}
			_movie = Object.assign(movie, movieObj);
			_movie.save((err, movie) => {
				if (err) {
					console.log(err)
				}
				// 添加
				Category.findById(movie.category, (err, category) => {
					if (category.movies.indexOf(movie._id) > -1) {
						return
					} else {
						category.movies.push(movie._id);
					}
					category.save((err, category) => {
						if (err) {
							console.log(err);
						}
					});
					// 删除
					Category.findOne({"movies": movie._id}, (err, category) => {
						if (category.movies.length > 0) {
							category.movies.forEach((e, i) => {
								if (e.toString() === movie._id.toString()) {
									category.movies.splice(i, 1)
								}
							})
							category.save((err, category) => {
								if (err) {
									console.log(err);
								} else {
									console.log("保存成功");
								}
							})
						}
					})
				})
				
				res.redirect('/');
			})
		})
	} else {
		_movie = new Movie(movieObj);
		let categoryId = movieObj.category;
		let categoryName = movieObj.categoryName;
		if (categoryId || categoryName) {
			_movie.save((err, movie) => {
				if (err) {
					console.log(err)
				}
				if (categoryId) {
					Category.findById(categoryId, (err, category) => {
						category.movies.push(_movie.id);
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
						movies: [movie._id]
					})
					category.save((err, category) => {
						movie.category = category._id;
						movie.save((err, movie) => {
							res.redirect('/weintern/job/' + movie._id);
						})
					})
				}
			})
		} else {
			let msg = "请选择电影分类！";
			res.redirect(`/weintern/status?return_url=/admin/movie/add&code=0&tips=${msg}`);
		}
	}
})

// 删除实习岗位
router.delete('/weintern/job/list', requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		Category.findOne({"movies": id}, (err, category) => {
			let index = category.movies.indexOf(id);
			category.movies.splice(index, 1);
			category.save((err, category) => {
				if (err) console.log(err);
			})
		});
		Movie.remove({_id: id}, (err, movie) => {
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
	let content = _comment.content;
	let movieId = _comment.movie;
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
					console.log("回复评论人", comment)
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
				res.redirect("/weintern/job/" + movieId)
			}
		})
	}
});

module.exports = router;