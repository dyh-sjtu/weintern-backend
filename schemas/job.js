let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;
let JobSchema = new mongoose.Schema({
	jobname: String,  // 实习标题
	desc: {   // 实习公司描述 || 职位诱惑
		type: String,
		default: ''
	},
	jobcontent: {  // 工作内容
		type: Array,
		default:[]
	},
	skill: {  // 技能要求
		type: Array,
		default:[]
	},
	salary: {  // 薪资水平
		type: ObjectId,
		ref: 'salary'
	},
	worksite: {  // 实习地点
		type: ObjectId,
		ref: 'worksite'
	},
	internWeek: {  // 实习时长，一周几天
		type: Number,
		default: 3
	},
	interMonth: {  // 实习时长，持续月份
		type: Number,
		default: 3
	},
	education: {  // 学历要求
		type: String,
		default:'本科'
	},
	resumeAddr: {  // 邮箱投递地址
		type: String,
		default:''
	},
	note: {  // 备注
		type: String,
		default: ''
	},
	pv: {  // 网站访问统计量
		type: Number,
		default: 0
	},
	category: {  // 行业类别
		type: ObjectId,
		ref: 'Category'
	},
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
