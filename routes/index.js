var express = require('express');
var router = express.Router();
multiparty = require('multiparty');
var imageColors = require('imagecolors');
const fs = require('fs');
const colors=''

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/colorsImg', function(req, res){
  // создаем форму
  var form = new multiparty.Form();
  var uploadFile = {uploadPath: '', type: '', size: 0};
  var maxSize = 100 * 1024 * 1024;
  var supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
  var errors = [];
  var nameImg='';
  //если произошла ошибка
  form.on('error', function(err){
    if(fs.existsSync(uploadFile.path)) {
      fs.unlinkSync(uploadFile.path);
      console.log('error');
    }
  });
  form.on('close', function() {
    if(errors.length == 0) {
      res.send({status: 'ok', text: 'Success',name:nameImg});
    }
    else {
      if(fs.existsSync(uploadFile.path)) {
        fs.unlinkSync(uploadFile.path);
      }
      res.send({status: 'bad', errors: errors});
    }
  });
  form.on('part', function(part) {
    uploadFile.size = part.byteCount;
    uploadFile.type = part.headers['content-type']
    uploadFile.path = './' + part.filename;
    nameImg=part.filename;
    console.log(part)
    if(uploadFile.size > maxSize) {
      errors.push('File size is ' + uploadFile.size + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
    }
    if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
      errors.push('Unsupported mimetype ' + uploadFile.type);
    }
    if(errors.length == 0) {
      var out = fs.createWriteStream(uploadFile.path);
      part.pipe(out);
    }
    else {
      part.resume();
    }
  });

  form.parse(req);


});
router.post('/colors', function(req, res){

  imageColors.extract('./'+req.body.name, 6, function (err, colors) {
    this.colors=colors
  });
  res.send(this.colors)
});

module.exports = router;
