const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let WechatUserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	nickName: String,
	country: String,
	province: String,
	city: String,
	avatarUrl: String,
	gender: Number,
	feedback: String,
	tel: String,
	email: Number,
	likes: {
		type: ObjectId,
		ref: 'Job'
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


// 保存用户信息
WechatUserSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next()
});

WechatUserSchema.statics = {
	fetch: function (cb) {
		return this
			.find({})
			.sort({'meta.updateAt': -1})
			.exec(cb)
	},
	findById: function (id, cb) {
		return this
			.findOne({_id: id})
			.exec(cb)
	}
};

module.exports = WechatUserSchema;