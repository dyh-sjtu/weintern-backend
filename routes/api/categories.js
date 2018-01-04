let express = require('express');
let router = express.Router();
// let config = require('../../config/config');
let Category = require('../../models/category');

// router.get('/', (req, res) => {
// 	let echostr, nonce, signature, timestamp;
// 	signature = req.query.signature;
// 	timestamp = req.query.timestamp;
// 	nonce = req.query.nonce;
// 	echostr = req.query.echostr;
// 	console.log(signature + ";" + timestamp + ";" + echostr + ":" + nonce);
// 	if (checkToken(timestamp, nonce, signature, config.wechat.token)) {
// 		console.log("比对成功");
// 		return res.send(echostr);
// 	} else {
// 		console.log('比对失败');
// 		return res.end();
// 	}
// });

router.get('/job/categories', (req, res) => {
	Category.find({})
		.populate("jobs", "jobname company")
		.exec((err, categories) => {
			return res.json({
				success:1,
				data: categories
			});
		})
});

// function checkToken(timestamp, nonce, signature, token) {
// 	let currSign, tmp;
// 	tmp = [token, timestamp, nonce];
// 	tmp.sort();
// 	tmp.join('');
// 	let shasum = crypto.createHash('sha1');
// 	shasum.update(tmp);
// 	currSign = shasum.digest("hex");
// 	return currSign == signature;
// }

module.exports = router;
