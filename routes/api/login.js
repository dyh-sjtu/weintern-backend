const express = require('express');
const router = express.Router();
let config = require('../../config/config');

router.get('/wx/login', (req, res) => {
	let code = req.query.code;
	console.log(code);
	request.get({
		uri: 'https://api.weixin.qq.com/sns/jscode2session',
		json: true,
		qs: {
			grant_type: 'authorization_code',
			appid: config.appid,
			secret: config.secret,
			js_code: code
		}
	},(err, response, data) => {
		if (response.statusCode === 200) {
			console.log("[openid]", data.openid);
			console.log("[session_key]", data.session_key);
			
			//TODO: 生成一个唯一字符串sessionid作为键，将openid和session_key作为值，存入redis，超时时间设置为2小时
			//伪代码: redisStore.set(sessionid, openid + session_key, 7200)
			res.json({
				success: 1,
				data: {
					sessionID: data.session_key,
					openId: data.openid
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