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

module.exports = router;