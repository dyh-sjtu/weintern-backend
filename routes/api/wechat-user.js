const express = require('express');
const router = express.Router();
const WechatUser = require('../../models/wechat-user');
const Auth = require('../middleware/auth');
const Job = require('../../models/job');

// 保存或删除收藏
router.get('/favorite/save', Auth.requiredOpenid, (req, res) => {
	let openid = req.query.openid;
	let favoriteId = req.query.favoriteId;
	if (openid) {
		WechatUser.find({username: openid})
			.exec((err, user) => {
				if (err) {
					return res.json({
						success: 0,
						data: {}
					})
				}
				if (!user.likes) {
					user.likes = [];
					user.likes.push(favoriteId);
					// 添加岗位下的收藏者
					Job.find({_id: favoriteId})
						.exec((err, job) => {
							if (err) {
								console.log(err);
							}
							job.beCollected = [];
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
				} else if (user.likes && user.likes.indexOf(favoriteId) > -1) {
					let index = user.likes.indexOf(favoriteId);
					user.likes.splice(index, 1);  // 如果喜欢的岗位id存在，则表示需要删除收藏
					// 删除岗位下收藏的人
					Job.find({_id: favoriteId})
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
					Job.find({_id: favoriteId})
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
	
	WechatUser.find({username: openid}, (err, user) => {
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

module.exports = router;