let express = require('express');
let router = express.Router();
let User = require('../../models/user');

// 用户列表
router.get('/weintern/user/list', requiredAdmin, (req, res) => {
	User.fetch((err, users) => {
		if (err) {
			console.log(err)
		} else {
			res.render('userList', {
				title: '用户列表页',
				users: users
			})
		}
	})
});

// 删除用户
router.delete('/weintern/user/list', requiredAdmin, (req, res) => {
	let id = req.query.id;
	if (id) {
		User.remove({
			_id: id
		}, (err, user) => {
			if (err) {
				console.log(err)
			} else {
				res.json({
					success: 1
				})
			}
		})
	}
})