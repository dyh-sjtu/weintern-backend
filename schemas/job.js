let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;
let JobSchema = new mongoose.Schema({
	jobname: String,   // 实习标题,
	company:String,   // 公司名称
	companyUrl: String,  // 公司主页
	companyAddr: String,  // 公司地址
	image: {   // 企业的log，如果没有，则使用默认的图标
		type: String,
		default: 'weintern.png'
	},
	desc: String,   // 实习公司描述 || 职位诱惑
	jobcontent: String,  // 工作内容
	skill: String,  // 技能要求
	salary: String,  // 薪资水平
	worksite: {  // 实习地点
		type: ObjectId,
		ref: 'Worksite'
	},
	internWeek:String,  // 实习时长，一周几天
	interMonth: String,  // 实习时长，持续月份
	education: String,  // 学历要求
	email: String,   // 邮箱投递地址
	note: String,  // 岗位备注
	pv: {  // 网站访问统计量
		type: Number,
		default: 0
	},
	category: {  // 行业类别
		type: ObjectId,
		ref: 'Category'
	},
	deadline: {  // 默认截至时期为当前录入时间往后推一个月
		type: Date,
		default: Date.now() + 30*24*60*60*1000
	},
	canBeRegular: Boolean, // 是否可转正
	welfare: String,  // 职位福利
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

// 为模式添加新的方法
JobSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next()
});

JobSchema.statics = {
	fetch: function (cb) {
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById: function (id, cb) {
		return this
			.findOne({_id: id})
			.exec(cb)
	}
};

module.exports = JobSchema;
