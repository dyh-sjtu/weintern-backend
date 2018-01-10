// 权限中间件
exports.requiredLogin = (req, res, next) => {
	let _user = res.locals.user;
	if (!_user) {
		res.locals.admin = false;
		return res.redirect('/weintern/signIn');
	}
	next();
};

exports.requiredAdmin = (req, res, next) => {
	let _user = res.locals.user;
	if (_user.role < 10 || _user.role === 'undefined') {
		console.log("没有权限");
		res.locals.admin = false;
		return res.redirect("/weintern/signIn");
	}
	next();
};

exports.requiredOpenid = (req, res, next) => {
	console.log(req + ';;;;' + req.body);
	let openid = req.body.openid;
	if (!openid) {
		return res.json({
			success: 0,
			errMessage: '您没有授权, 请您删除微信首页的weintern小程序,并重新添加小程序重新授权'
		})
	}
	
	next();
};