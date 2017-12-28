let express = require('express');
let router = express.Router();
let User = require('../../models/user');

// 用户登录
router.post('/weintern/user/signIn', (req, res) => {
	let _user = req.body.user;
	let name = _user.name;
	let password = _user.password;
	User.findOne({
		name: name
	}, (err, user) => {
		if (err) console.log(err);
		if (!user) {
			console.log('用户不存在');
			let msg = "用户不存在，去注册吧！";
			res.redirect(`/weintern/status?return_url=/weintern/signUp&code=0&tips=${msg}`)
		} else {
			console.log('用户存在:' + name, password);
			user.comparePassword(password, (err, isMatch) => {
				console.log(password, isMatch);
				if (err) console.log(err);
				if (isMatch) {
					req.session.user = user;
					res.redirect('/');
					console.log('登录成功:Password is matched')
				} else {
					console.log('登录失败:Password is not matched');
					let msg = "登录失败，密码可能错误，请重新登录！";
					res.redirect(`/weintern/status?return_url=/weintern/signIn&code=0&tips=${msg}`)
				}
			})
		}
	})
});

// 用户注册
router.post('/weintern/user/signUp', (req, res) => {
	let userObj = req.body.user;
	console.log("userObj", userObj);
	// 如果是已经注册过的，直接重定向到首页
	User.findOne({
		name: userObj.name
	}, (err, user) => {
		if (err) console.log(err);
		if (user) {
			let msg = "账号存在，去登录吧！";
			res.redirect(`/weintern/status?return_url=/weintern/signIn&code=0&tips=${msg}`)
		} else {
			let _user = new User(userObj);
			_user.firstSave = true;
			_user.save((err, user) => {
				if (err) {
					console.log(err)
				}
				let msg = "注册成功，去登录吧！";
				res.redirect(`/weintern/status?return_url=/weintern/signIn&code=1&tips=${msg}`)
			})
		}
	})
});

// loginout 注销用户
router.get('/weintern/loginout', (req, res) => {
	// 注销用户需要删除当前用户和本地session中的用户
	delete req.session.user;
	delete res.locals.user;
	res.redirect('/');
});

router.get('/weintern/signIn', (req, res) => {
	res.render('signIn', {
		title: '登录'
	})
});

router.get('/weintern/signUp', (req, res) => {
	res.render('signUp', {
		title: '注册'
	})
});

module.exports = router;