const express = require("express");
const myImages = require("../lib/my-images");
const modelDatastore = require("../lib/model-datastore");

const router = express.Router();

const KIND = "Snapshot";

router.setSocketIo = function(socket, io) {
    router.io = io;
    router.socket = socket;
};

// add a image to google cloud storage
router.post(
    "/add",
    myImages.multer.single("image"),
    myImages.sendUploadToGCS,
    (req, res, next) => {
        let data = req.body;

        data.time = new Date();

        if (req.file && req.file.cloudStoragePublicUrl) {
            data.imageUrl = req.file.cloudStoragePublicUrl;
        }

        // Save the data to the database.
        modelDatastore.create(KIND, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }

            modelDatastore.list(KIND, (err, entities) => {
                if (err) {
                    next(err);
                    return;
                }

                if (router.io) {
                    console.log("reload images");
                    router.io.emit("reload images", entities);
                    res.json({
                        result: "success"
                    });
                } else {
                    res.json({
                        result: "fail"
                    });
                }

                res.end();
            }, 10, { item: "time", option: { descending: true } });
        });
    }
);

router.get("/loadAll", (req, res, next) => {
    modelDatastore.list(KIND, (err, entities) => {
        if (err) {
            next(err);
            return;
        }

        if (router.io) {
            console.log("reload images");
            router.io.emit("reload images", entities);
            res.json({
                result: "success"
            });
        } else {
            res.json({
                result: "fail"
            });
        }

        res.end();
    }, 10, { item: "time", option: { descending: true } });
});



module.exports = router;