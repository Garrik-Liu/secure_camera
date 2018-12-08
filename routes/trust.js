const express = require("express");
const myImages = require("../lib/my-images");
const modelDatastore = require("../lib/model-datastore");
const nodemailer = require('nodemailer');

const router = express.Router();

const KIND = "TrustFace";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
    user: 'garrikliu@Gmail.com', //邮箱的账号
    pass: 'G078o166@'//邮箱的密码
    }
});

router.setSocketIo = function(socket, io) {
    router.io = io;
    router.socket = socket;

    router.socket.on('add face', function(data) {
        myImages.sendCropUploadToGCS(data, function(cropUrl) {
            let cropData = {};
            cropData.name = data.name;
            cropData.description = data.description;
            cropData.url = cropUrl;

            modelDatastore.create(KIND, cropData, (err, savedData) => {
                if (err) {
                    console.log(err);
                    return;
                }

                router.socket.emit('add face result', { 'resCode': 0, 'msg': 'A face is added' });
            });
        });
    })

    router.socket.on('request trustFaces', function() {

        modelDatastore.list(KIND, (err, entities) => {
            if (err) {
                next(err);
                return;
            }

            let faceList = entities || [];

            router.socket.emit('get trustFaces', faceList)
        });
    })

    router.socket.on('send email', function(emailInfo) {

        let mailOptions = {
            from: '<garrikliu@gamil.com>', //邮件来源
            to: `${emailInfo.email}`, //邮件发送到哪里，多个邮箱使用逗号隔开
            subject: 'UNKNOWN FACE WARNNING', // 邮件主题
            html: '<p>An unknowned face is detected!!!</p>', // html类型的邮件正文
            attachments: [
            {
                filename: 'face.png',//附件名称
                path: `${emailInfo.imgUrl}`,//附件的位置
                cid: '123456789' //为附件添加一个引用名称
            }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

    })
};

router.get("/", (req, res, next) => {
    modelDatastore.list(KIND, (err, entities) => {
        if (err) {
            next(err);
            return;
        }

        let faceList = entities || null;

        res.render("trustList", { faceList: faceList });
    });
});

// router.post(
//     "/addFace",
//     myImages.multer.single("image"),
//     myImages.sendUploadToGCS,
//     (req, res, next) => {

//         let data = req.body;

//         if (req.file && req.file.cloudStoragePublicUrl) {

//             data.imageUrl = req.file.cloudStoragePublicUrl;

//         }

//         // Save the data to the database.
//         modelDatastore.create(KIND, data, (err, savedData) => {
//             if (err) {
//                 next(err);
//                 return;
//             }
//             res.json({ state: 0, msg: 'A new face is added!' })
//             res.redirect('/trustList');
//         });
//     });


router.get("/deleteFace", (req, res, next) => {


    let id = req.query.id;

    modelDatastore.delete(KIND, id, (err) => {
        if (err) {
            next(err);
            return;
        }

        res.redirect('/trustList');
    });

});


module.exports = router;