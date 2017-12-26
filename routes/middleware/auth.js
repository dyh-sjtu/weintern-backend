// 权限中间件
let requiredLogin = (req, res, next) => {
	let _user = res.locals.user;
	if (!_user) {
		res.locals.admin = false;
		return res.redirect('/weintern/signIn');
	}
	next();
};

let requiredAdmin = (req, res, next) => {
	let _user = res.locals.user;
	if (_user.role < 10 || _user.role === 'undefined') {
		console.log("没有权限");
		res.locals.admin = false;
		return res.redirect("/weintern/signIn");
	}
	next();
};


module.exports = {
	requiredLogin,
	requiredAdmin
};