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
            let cropCanvs = $('#faceUploadCropPreview')[0];

            let ctx = cropCanvs.getContext('2d');

            uploadedImage.src = $image.attr('src');

            uploadedImage.onload = function() {
                cropCanvs.width = uploadedImage.width;
                cropCanvs.height = uploadedImage.height;
                ctx.drawImage(uploadedImage, x, y, width, height, 0, 0, width, height);

                let cropImg = new Image();

                cropImg.src = cropCanvs.toDataURL('image/png', 1.0);
                cropImg.onload = function() {
                    console.log(cropImg)
                }
            }
        }
    });
});


$(document).ready(function() {


    trustFace_DeleteListner();
    trustFace_UploadListner();

    function trustFace_UploadListner() {
        $('#addNewFaceModel_submitBtn').on('click', function() {
            let nameInput = $('#addNewFaceModel_nameInput');
            let descriptionInput = $('#addNewFaceModel_descriptionInput');
            let actionUrl = $('#addNewFaceModel_form').attr('action');

            getCropImage(function(cropImg) {
                let formData = new FormData();
                formData.append('name', nameInput);
                formData.append('description', descriptionInput);
                formData.append('image', cropImg);

                $.ajax({
                    url: actionUrl,
                    type: 'POST',
                    cache: false,
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(function(res) {
                    console.log('success', res)

                }).fail(function(res) {
                    console.log('fail', res)
                });


            })
        })
    }

    function trustFace_DeleteListner() {
        $(".trustFaces__deleteBtn").each(function(index) {
            $(this).on('click', function() {
                let id = $(this).data('id');
                $("#deleteFaceModelInputId").attr('value', id);
            });
        });
    }

    function getCropImage(cb) {}
});