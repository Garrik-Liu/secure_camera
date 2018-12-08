var addNewFaceModel_form = document.getElementById("addNewFaceModel_form");

let cropImageBuffer = null;

getCropImage(function(result) {
    cropImageBuffer = result;
});

trustFace_DeleteListner();
trustFace_UploadListner();

function getCropImage(cb) {
    $('#addNewFaceModel_faceUpload').imageupload(null, function() {

        let $image = $('#image');

        $image.cropper({
            aspectRatio: 4 / 3,
            crop: function(event) {
                let x = event.detail.x;
                let y = event.detail.y;
                let width = event.detail.width;
                let height = event.detail.height;

                let uploadedImage = new Image();
                let cropCanvs = document.createElement("canvas");

                let ctx = cropCanvs.getContext('2d');

                uploadedImage.src = $image.attr('src');

                uploadedImage.onload = function() {
                    cropCanvs.width = width;
                    cropCanvs.height = height;

                    ctx.drawImage(uploadedImage, x, y, width, height, 0, 0, width, height);

                    cropCanvs.toBlob((blob) => {
                        var reader = new FileReader();

                        reader.onloadend = function() {
                            cb(reader.result);
                        }

                        reader.readAsArrayBuffer(blob);
                    })
                }
            }
        });
    });
}




function trustFace_DeleteListner() {
    $(".trustFaces__deleteBtn").each(function(index) {
        $(this).on('click', function() {
            let id = $(this).data('id');
            $("#deleteFaceModelInputId").attr('value', id);
        });
    });
}

function trustFace_UploadListner() {
    $('#addNewFaceModel_submitBtn').on('click', function() {
        if (cropImageBuffer) {

            let nameInput = $('#addNewFaceModel_nameInput').val();
            let descriptionInput = $('#addNewFaceModel_descriptionInput').val();

            let postData = {
                name: nameInput,
                description: descriptionInput,
                imgBuffer: cropImageBuffer
            }

            socket.emit('add face', postData);

            socket.on('add face result', function(res) {

                if (res.resCode === 0) {
                    location.reload();
                }
            })

            cropImageBuffer = null;
        }
    })
}