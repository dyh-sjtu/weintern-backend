let express = require('express');
let router = express.Router();
let User = require('../../models/user');
let Auth = require('../middleware/auth');
let SaveFile = require('../middleware/upload');

// 获取用户信息页面
router.get('/weintern/user/center', Auth.requiredLogin, (req, res) => {
	let userId = req.query.userId;
	// console.log(userId)
	User.findById(userId, (err, user) => {
		res.render('userCenter', {
			title: '个人中心',
			user: user
		});
	})
});

// 更新用户信息
router.post('/weintern/user/info', Auth.requiredLogin, SaveFile.saveFile, (req, res) => {
	let userObj = req.body.user;
	let headPic = req.image;
	let userId = userObj._id;
	// console.log("userObj", userObj)
	let _User;
	User.findById(userId, (err, user) => {
		console.log(user);
		_User = Object.assign(user, userObj);
		if (headPic) {
			_User.img = headPic;
		}
		_User.firstSave = false;
		_User.save((err, user) => {
			if (err) {
				console.log(err)
			} else {
				res.redirect(`/weintern/status?return_url=/user/center?userId=${userId}&code=1&tips=保存成功`)
			}
		})
	})
});

module.exports = router;