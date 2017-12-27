let path = require('path');
let fs = require('fs');

exports.saveFile = (req, res, next) => {
	let posterData = req.files.uploadPic;
	let filePath = posterData.path;
	let originalFilename = posterData.originalFilename;
	// console.log(posterData+'\n',filePath+'\n',originalFilename+'\n');
	if (originalFilename) {
		fs.readFile(filePath, (err, data) => {
			let timestamp = Date.now();
			let type = posterData.type.split('/')[1]
			let newImage = timestamp + '.' + type;
			let newPath = path.join(__dirname, '../../', '/public/uploads/' + newImage)
			// console.log(newPath)
			fs.writeFile(newPath, data, (err, data) => {
				// console.log("数据写入成功！");
				req.image = newImage;
				next();
			})
		})
	} else {
		next();
	}
};