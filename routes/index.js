var express = require('express');
var router = express.Router();
var ioListener = require('../lib/ioListener');

router.setSocketIo = function(socket, io) {
    router.io = io;
    router.socket = socket;
}

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/upload', function(req, res, next) {
    res.render('uploadImg');
});


module.exports = router;