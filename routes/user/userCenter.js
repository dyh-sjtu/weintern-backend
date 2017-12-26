let express = require('express');
let router = express.Router();
let User = require('../../models/user');
let {requiredLogin} = require('../middleware/auth');
let path = require('path');
let fs = require('fs');
let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();
let savePic = (req, res, next) => {
	let posterData = req.files.uploadPic;
	let filePath = posterData.path;
	let originalFilename = posterData.originalFilename;
	// console.log(posterData+'\n',filePath+'\n',originalFilename+'\n');
	if (originalFilename) {
		fs.readFile(filePath, (err, data) => {
			let timestamp = Date.now();
			let type = posterData.type.split('/')[1]
			let headPic = timestamp + '.' + type;
			let newPath = path.join(__dirname, '../../', '/public/uploads/' + headPic)
			// console.log(newPath)
			fs.writeFile(newPath, data, (err, data) => {
				// console.log("数据写入成功！");
				req.headPic = headPic;
				next();
			})
		})
	} else {
		next();
	}
};

// 获取用户信息页面
router.get('/weintern/user/center', requiredLogin, (req, res) => {
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
router.post('/weintern/user/info', multipartMiddleware, requiredLogin, savePic, (req, res) => {
	let userObj = req.body.user;
	let headPic = req.headPic;
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