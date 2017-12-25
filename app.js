//导入依赖模块
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
// 连接数据库
let dbUrl = 'mongodb://localhost/weintern';
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl,{useMongoClient: true});  // mongodb版本更新了

//设置端口
let port = process.env.PORT || 8100;
let app = express();
let index = require('./routes/movie/index');
let admin = require('./routes/admin/admin');
let user = require('./routes/user/user');
let category = require('./routes/admin/categoryAdmin');
let userCenter = require('./routes/admin/userCenter');
let status = require('./routes/status/status');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static(path.join(__dirname, 'public'))); // 设置静态目录
let moment = require('moment');
moment.locale('zh-cn');
app.locals.moment = moment; // 定义整个项目使用moment
app.use(session({
	secret: 'weintern',
	name: 'login-user', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 5
	}, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
	store: new MongoStore({
		url: dbUrl,
		collection: 'sessions'
	}),
	resave: false,
	saveUninitialized: true
}))
app.listen(port, () => {
	console.log('server running on port: ' + port);
});

if ('development' === app.get('env')) {
	app.set('showStackError', true);
	app.use(logger(':method :url :status'));
	app.locals.pretty = true;
	mongoose.set('debug', true);
}

app.use((req, res, next) => {
	// console.log("user in session:"+req.session.user)
	let _user = req.session.user;
	if(_user){
		res.locals.user = _user;
	}
	next();
})

app.use((err, req, res, next) => {
	err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// index route
app.use('/', index);
// status:success || fail
app.use('/', status);
// user route
app.use('/', user);
// admin route
app.use('/', admin);
// admin category
app.use('/', category);
// user center
app.use('/', userCenter);

