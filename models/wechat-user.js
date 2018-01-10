let mongoose = require('mongoose');
let WechatUserSchema = require('../schemas/wechat-user');
let WechatUser = mongoose.model('WechatUser', WechatUserSchema);
module.exports = WechatUser;