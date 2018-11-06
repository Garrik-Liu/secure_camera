var express = require('express');
var router = express.Router();
var ioListener = require('../lib/ioListener');
var dataServiceAuth = require('../public/javascripts/loginDataAuth');

var router = express.Router();

router.setSocketIo = function(socket, io) {
    router.io = io;
    router.socket = socket;
}

router.get(['/dashboard', '/'], function(req, res, next) {
    res.render('dashboard');
});

router.get('/howto', function(req, res, next) {
    res.render('howto');
});

router.get('/aboutUs', function(req, res, next) {
    res.render('aboutUs');
});

router.get("/header", (req, res) => {
    res.render("header");
});


//-----------------------------post router-----------------------------------------------------
router.post("/api/register", (req, res)=>{
    dataServiceAuth.registerUser(req.body).then(() => {
        
    }).catch((err) => {
    });
});

router.post("/api/updatePassword", (req, res) =>{
    dataServiceAuth.checkUser({ user: req.body.user, password: req.body.currentPassword}).then(() => {
        console.log(chalk.bgBlue("The_password_already_checked"));
        dataServiceAuth.updatePassword(req.body).then(() => {
            console.log(chalk.bgBlue(">>>Now Update the password!!!!"));
            res.send({successMessage: "Password changed successfully for user: ", user: req.body.user});
        }).catch((err) => {
            console.log(chalk.red(">>>1Error Update the password!!!!"));
            res.send({errorMessage:"The new passwords do not match."});
        });
    }).catch((err) => {
        console.log(chalk.red(">>>2Error Update the password!!!!"));
        console.log(err);
        res.send({errorMessage: err});
    });
});






module.exports = router;