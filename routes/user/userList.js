let express = require('express');
let router = express.Router();
let User = require('../../models/user');
// 权限中间件
let Auth = require('../middleware/auth');


// 用户列表
router.get('/weintern/user/list',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
	User.fetch((err, users) => {
		let localUser = req.session.user;
		if (err) {
			console.log(err)
		} else {
			res.render('userList', {
				title: '用户列表页',
				users: users,
				localUser: localUser
			})
		}
	})
});

// 删除用户
router.delete('/weintern/user/list/del',Auth.requiredLogin,  Auth.requiredAdmin, (req, res) => {
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

module.exports = router;