const express = require("express");
const myImages = require("../lib/my-images");
const modelDatastore = require("../lib/model-datastore");
const nodemailer = require('nodemailer');

const router = express.Router();

const KIND = "TrustFace";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'ryan.wang23@hotmail.com',
           pass: 'xxxxx'
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
            from: 'ryan.wang23@hotmail.com',
            to: `${emailInfo.email}`,
            subject: 'UNKNOWN FACE WARNNING',
            html: '<p>An unknowned face is detected!!!</p>',
            attachments: [
            {
                filename: 'face.png',
                path: `${emailInfo.imgUrl}`,
                cid: '123456789'
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