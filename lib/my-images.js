const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const config = require("../config");

const CLOUD_BUCKET = config["CLOUD_BUCKET"];

const storage = new Storage({
    projectId: config["GCLOUD_PROJECT"]
});
const bucket = storage.bucket(CLOUD_BUCKET);

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    }
});

// upload images to Google Cloud Storage
function sendUploadToGCS(req, res, next) {
    if (!req.file) {
        return next();
    }

    const gcsname = Date.now() + req.file.originalname;
    const file = bucket.file(gcsname);
    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        },
        resumable: false
    });

    stream.on("error", err => {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on("finish", () => {
        req.file.cloudStorageObject = gcsname;
        file.makePublic().then(() => {
            req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
            next();
        });
    });

    stream.end(req.file.buffer);
}

function sendCropUploadToGCS(data, cb) {

    const gcsname = Date.now() + data.name.replace(/\s+/g, "");
    const file = bucket.file(gcsname);
    const stream = file.createWriteStream({
        metadata: {
            contentType: 'image/png'
        },
        resumable: false
    });

    stream.on("error", err => {
        console.log(err);
    });

    stream.on("finish", () => {
        file.makePublic().then(() => {
            cb(getPublicUrl(gcsname));

        });
    });

    stream.end(data.imgBuffer);
}

function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

module.exports = {
    multer,
    sendUploadToGCS,
    sendCropUploadToGCS,
    getPublicUrl
};