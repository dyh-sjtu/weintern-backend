const expresss = require('express');
const router = expresss.Router();
const WechatUser = require('../../models/wechat-user');
const Auth = require('../middleware/auth');

router.get('/weintern/user/wehcatList', Auth.requiredLogin, Auth.requiredAdmin, (req, res) => {
	WechatUser.find({})
		.exec((err, users) => {
			if (err) {
				cosnole.log(err);
			}
			res.render('wechatUser', {
				title: '微信用户列表',
				wechatUsers: users
			})
		})
});

module.exports = router;