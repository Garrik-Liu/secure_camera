function compareFaces(imageUrl_1, imageUrl_2, cb) {
    AnonLog();

    loadImgUrl(imageUrl_1, function(imageBytes_1) {
        loadImgUrl(imageUrl_2, function(imageBytes_2) {
            detectFaces(imageUrl_1, function(result_1) {
                detectFaces(imageUrl_2, function(result_2) {
                    if (result_1.FaceDetails.length > 0 && result_2.FaceDetails.length > 0) {
                        AWS.region = "us-east-2";
                        var rekognition = new AWS.Rekognition();
                        var params = {
                            // trust face
                            SourceImage: {
                                Bytes: imageBytes_1
                            },

                            // snapshot
                            TargetImage: {
                                Bytes: imageBytes_2
                            },
                            SimilarityThreshold: 0.0
                        };

                        rekognition.compareFaces(params, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else {
                                cb(data);
                            }
                        });
                    } else {
                        cb(null);
                    }
                })
            })
        })
    })
}

function loadImgUrl(imageUrl, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var url = URL.createObjectURL(this.response);
        var img = new Image();
        img.crossOrigin = 'anonymous';
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext('2d');
        img.src = url;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                var reader = new FileReader();

                reader.onloadend = (function(file) {
                    return function(e) {
                        cb(e.target.result)
                    };
                })(blob)

                reader.readAsArrayBuffer(blob);
            })
            URL.revokeObjectURL(url);
        };

    };
    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'blob';
    xhr.send();
}

function detectFaces(imageUrl, cb) {
    AnonLog();

    loadImgUrl(imageUrl, function(imgBytes) {
        AWS.region = "us-east-2";
        var rekognition = new AWS.Rekognition();
        var params = {
            Image: {
                Bytes: imgBytes
            }
        };

        rekognition.detectFaces(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                cb(data);
            }
        });
    })
}



//Provides anonymous log on to AWS services
function AnonLog() {
    if (!AWS.config.credentials) {
        // Configure the credentials provider to use your identity pool
        AWS.config.region = 'us-east-2'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-2:eaa573bd-b153-4088-8a64-384862359380',
        });
        // Make the call to obtain credentials
        AWS.config.credentials.get(function() {
            // Credentials will be available when this function is called.
            var accessKeyId = AWS.config.credentials.accessKeyId;
            var secretAccessKey = AWS.config.credentials.secretAccessKey;
            var sessionToken = AWS.config.credentials.sessionToken;
        });
    }
}

function dataURLToBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}