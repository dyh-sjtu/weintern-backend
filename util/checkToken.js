let crypto = require('crypto');
let config = require('../config/config');

exports.wechat = function (req, res) {
	let echostr, nonce, signature, timestamp;
	signature = req.query.signature;
	timestamp = req.query.timestamp;
	nonce = req.query.nonce;
	echostr = req.query.echostr;
	if (checkToken(timestamp, nonce, signature, config.wechat.token)) {
		return res.send(echostr);
	} else {
		return res.end();
	}
};


function checkToken(timestamp, nonce, signature, token) {
	let currSign, tmp;
	tmp = [token, timestamp, nonce].sort().join("");
	currSign = crypto.createHash("sha1").update(tmp).digest("hex");
	return currSign === signature;
}