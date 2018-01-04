//导入依赖模块
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let multipart = require('connect-multiparty');

// 连接数据库
let dbUrl = 'mongodb://localhost/weintern';
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl,{useMongoClient: true});  // mongodb版本更新了

//设置端口
let port = process.env.PORT || 8100;
let app = express();

// 用户首页
let index = require('./routes/index/index');

// 实习岗位相关
// 实习岗位管理
let jobManage = require('./routes/job/job');
// 实习地点管理
let worksiteManage = require('./routes/job/worksite');
// 实习行业类别管理
let categoryMange = require('./routes/job/category');
// 实习岗位api
let api = require('./routes/api/categories');

// 用户相关
// 用户登录注册
let user = require('./routes/user/user');
// 用户中心
let userCenter = require('./routes/user/userCenter');
let userList = require('./routes/user/userList');

// 错误页面
let status = require('./routes/status/status');

// 模板引擎设置和模板渲染页面路径设置
app.set('views', './views/pages');
app.set('view engine', 'jade');

// 用于解析请求数据的中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// 用于解析文件上传的中间件
app.use(multipart());

// 用于放置静态目录的中间件
app.use(express.static(path.join(__dirname, 'public')));

// 用于设置本地时间格式化的中间件
let moment = require('moment');
moment.locale('zh-cn');
app.locals.moment = moment; // 定义整个项目使用moment

// 用于本地session临时存储的中间件设置
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
}));

// 用于本地session临时存储的中间件使用
app.use((req, res, next) => {
	// console.log("user in session:"+req.session.user)
	let _user = req.session.user;
	if(_user){
		res.locals.user = _user;
	}
	next();
});

// 用于错误页面的中间件
app.use((err, req, res, next) => {
	err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// 用于开发环境的调试堆栈信息
if ('development' === app.get('env')) {
	app.set('showStackError', true);
	app.use(logger(':method :url :status'));
	app.locals.pretty = true;
	mongoose.set('debug', true);
}


// 路由的切换页面
// 首页
app.use('/', index);

// 用户相关路由
// 用户登录注册
app.use('/', user);
// 用户中心
app.use('/', userCenter);
// 用户列表
app.use('/', userList);


// 实习岗位相关路由
// 实习岗位管理
app.use('/', jobManage);
// 实习地点管理
app.use('/', worksiteManage);
// 实习类别管理
app.use('/', categoryMange);

// 小程序的api接口
app.use('/api', api);


// status:success || fail 错误提示路由
app.use('/', status);

// 监听开发环境的端口或者设定的端口号
app.listen(port, () => {
	console.log('server running on port: ' + port);
});

