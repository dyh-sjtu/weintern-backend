const express = require('express');
const router = express.Router();
const WechatUser = require('../../models/wechat-user');
const Auth = require('../middleware/auth');
const Job = require('../../models/job');

// 保存或删除收藏
router.get('/favorite/save', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	let favoriteId = req.query.favoriteId;
	console.log(openid);
	if (openid) {
		WechatUser.findOne({username: openid}, (err, user) => {  // 注意find查找出来的是一个数组，findOne是一个对象。千万注意
			if (err) {
				return res.json({
					success: 0,
					data: {}
				})
			}
			if (user.likes && user.likes.indexOf(favoriteId) > -1) {
				let index = user.likes.indexOf(favoriteId);
				user.likes.splice(index, 1);  // 如果喜欢的岗位id存在，则表示需要删除收藏
				console.log(index);
				// 删除岗位下收藏的人
				Job.findOne({_id: favoriteId})
					.exec((err, job) => {
						if (job.beCollected.indexOf(user._id) > -1) {
							let _index = job.beCollected.indexOf(user._id);
							job.beCollected.splice(_index, 1);
							job.save((err, job) => {
								if (err) {
									console.log(err);
								}
							})
						}
					});
				user.save((err, user) => {
					if (err) {
						console.log(err);
					}
				});
				return res.json({
					success: 1,
					data: {
						message: '删除成功',
					}
				})
			} else {
				user.likes.push(favoriteId);
				// 添加岗位下的收藏者
				Job.findOne({_id: favoriteId})
					.exec((err, job) => {
						if (err) {
							console.log(err);
						}
						job.beCollected.push(user._id);
						job.save((err, job) => {
							if (err) {
								console.log(err);
							}
						})
					});
				user.save((err, user) => {
					if (err) {
						console.log(err)
					}
				});
				return res.json({
					success: 1,
					data: {
						message: '收藏成功'
					}
				})
			}
		})
	}
});

// 判断当前职位是否被该用户收藏
router.get('/wx/isFavorite', Auth.requiredOpenid, (req, res) => {
	let favoriteId = req.query.favoriteId;
	let openid = req.query.openid;
	
	WechatUser.findOne({username: openid}, (err, user) => {
		if (err) {
			console.log(err)
		}
		if (user.likes && user.likes.length > 0) {
			if (user.likes.indexOf(favoriteId) > -1) {
				return res.json({
					success: 1,
					data: {
						isFavorite: true
					}
				})
			} else {
				return res.json({
					success: 0,
					data: {}
				})
			}
		} else {
			return res.json({
				success: 0,
				data: {}
			})
		}
	})
});

// 获得收藏列表
router.get('/wx/favoriteList', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	
	WechatUser.findOne({username: openid})
		.populate({
			path: 'likes',
			populate: {
				path: 'worksite'
			}
		})
		.exec((err, user) => {
			if (err) {
				console.log(err)
			}
			return res.json({
				success: 1,
				data: user.likes
			})
		})
});

// 用户信息补充
router.get('/wx/user/userInfo', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	let userObj = {
		nickName: req.query.nickName,
		gender: req.query.gender,
		country: req.query.country,
		city: req.query.city,
		province: req.query.province,
		avatarUrl: req.query.avatarUrl,
	};
	WechatUser.findOne({username: openid}, (err, user) => {
		if (err) {
			console.log(err);
		}
		if (user) {
			let _userObj = Object.assign(user, userObj);
			_userObj.save((err, _user) => {
				if (err) {
					console.log(err)
				}
				return res.json({
					success: 1,
					data: {
						message: '信息添加成功'
					}
					
				})
			})
		}
	})
});


// 存储用户反馈
router.get('/wx/user/feedback', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	let feedback = req.query.feedback;
	
	WechatUser.findOne({username: openid}, (err, user) => {
		if (err) {
			console.log(err);
		}
		if (user) {
			user.feedback = feedback;
			user.save((err, _user) => {
				if (err) {
					console.log(err)
				}
				return res.json({
					success: 1
				})
			})
		}
	})
});


// 存储用户电话号码
router.get('/wx/user/tel', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	let tel = parseInt(req.query.tel);
	
	WechatUser.findOne({username: openid}, (err, user) => {
		if (err) {
			console.log(err);
		}
		if (user) {
			user.tel = tel;
			user.save((err, _user) => {
				if (err) {
					console.log(err);
				}
				return res.json({
					success: 1
				})
			})
		}
	})
});

// 获取用户信息
router.get('/wx/user/getUserInfo', (req, res) => {
	let openid = req.query.openid;
	
	WechatUser.findOne({username: openid}, (err, user) => {
		if (err) {
			console.log(err);
		}
		return res.json({
			success: 1,
			data: user
		})
	})
});


module.exports = router;