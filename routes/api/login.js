const express = require('express');
const router = express.Router();
const WechatUser = require('../../models/wechat-user');
let config = require('../../config/config');
let request = require('request');

router.get('/wx/login', (req, res) => {
	let code = req.query.code;
	console.log(code);
	console.log(config.wechat.appid);
	console.log(config.wechat.secret);
	request.get({
		uri: `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appid}&secret=${config.wechat.secret}&js_code=${code}&grant_type=authorization_code`,
		json: true,
	}, (err, response, data) => {
		//TODO: 生成一个唯一字符串sessionid作为键，将openid和session_key作为值，存入redis，超时时间设置为2小时
		if (response.statusCode === 200) {
			console.log("[openid]", data.openid);
			console.log("[session_key]", data.session_key);
			WechatUser.find({username: data.openid}, (err, wechatUser) => {
				if (err) {
					console.log(err)
				}
				if (wechatUser.length > 0) {
					res.json({
						success: 1,
						data: {
							sessionID: data.session_key,
							openId: data.openid
						}
					})
				} else {
					let wechatUserObj = {
						username: data.openid,
					};
					let _wechatUser = new WechatUser(wechatUserObj);
					_wechatUser.save((err, wechatUser) => {
						if (err) {
							console.log(err)
						}
						res.json({
							success: 1,
							data: {
								sessionID: data.session_key,
								openId: data.openid
							}
						})
					})
				}
			})
		} else {
			console.log("[error]", err);
			res.json({
				success: 0,
				data: {
					err: err
				}
			})
		}
	})
});

module.exports = router;