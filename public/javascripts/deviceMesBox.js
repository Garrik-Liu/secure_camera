let imgList = {};


$("#imgShowBoxId .closeBtn:first").click(function() {
    $("#imgShowBoxId")
        .toggleClass("imgShowBox--close")
        .toggleClass("imgShowBox");
});

socket.on("reload images", function(entities) {
    entities.forEach(e => {
        if (imgList[e.imageUrl] == null) {
            imgList[e.imageUrl] = e;
            imgList[e.imageUrl].checked = false;
        }
    })



    loadImages(entities);
    if ($("#deviceMesBox").css("width") == "0px") {
        $("#deviceBtnMesCount").css("opacity", 1);
        let num = Number($("#deviceBtnMesCount .mesCount__number:first").text());
        $("#deviceBtnMesCount .mesCount__number:first").html(++num);
    }
});

socket.on("load images", function(entities) {
    entities.forEach(e => {
        imgList[e.imageUrl] = e;
        imgList[e.imageUrl].checked = false;
    })



    loadImages(entities);
});


function loadImages(entities) {
    var content = "";

    entities.forEach(e => {
        var eTime = new Date(e.time);

        var imgElement = `
                <div class="deviceMesBox__imgElement">
                    <span class="deviceMesBox__imgTime">
                      ${eTime.toLocaleString()}
                    </span>
                    <img src=${e.imageUrl} alt="Snapshot" />
                </div>
            `;

        content += imgElement;
    });

    $(".deviceMesBox__mesWindow:first").html(content);

    ImageEventListener(".deviceMesBox__imgElement", "#imgShowBoxId", ".imgShowBox__imgContainer");

    for (let key in imgList) {
        let e = imgList[key];
        if (!e.checked) {
            checkFace(e.imageUrl);
            e.checked = true;
        }
    }
}

function checkFace(imgUrl) {
    let trustFacesObj = {
        faceList: null,
        faceInSnapshot: null
    };

    socket.emit('request trustFaces');
    socket.on('get trustFaces', function(faceList) {

        if (trustFacesObj.faceList === null) {
            trustFacesObj.faceList = faceList;

            faceList.forEach((element, index, array) => {

                compareFaces(element.url, imgUrl, function(result) {
                    if (result) {
                        let firstFace = result.FaceMatches[0];

                        let similarity = firstFace.Similarity;

                        if (similarity < 70) {
                            let emailInfo = {}
                            emailInfo.email = $('#headerUserDropBtn').data('email');
                            emailInfo.imgUrl = imgUrl;

                            socket.emit('send email', emailInfo);
                        }
                    }
                })
            });
        }
    })
}


function ImageEventListener(imgEleClass, imgShowId, imgShowBox__imgContainer) {

    $(imgEleClass).each(function(index) {
        $(this).click(function() {
            let trustFacesObj = {
                faceList: null,
                faceInSnapshot: null

            };

            $('#imgShowBoxFaceDetectPanel').html('');
            $('.imgShowBox__imgBoundingBox').css('opacity', 0)

            let imgUrl = $(this).children("img:first").attr("src");

            $(imgShowId)
                .toggleClass("imgShowBox--close")
                .toggleClass("imgShowBox");

            $(imgShowBox__imgContainer + ':first')
                .children("img:first")
                .attr("src", imgUrl);

            socket.emit('request trustFaces');
            socket.on('get trustFaces', function(faceList) {
                if (trustFacesObj.faceList === null) {
                    trustFacesObj.faceList = faceList;

                    faceList.forEach((element, index, array) => {
                        compareFaces(element.url, imgUrl, function(result) {

                            if (!result) {
                                $('#imgShowBoxFaceDetectPanel').html(`
                                    <p style="color: red; ">There is not any trust face!</p>
                                `);
                            } else {

                                if (!trustFacesObj.faceInSnapshot) {
                                    trustFacesObj.faceInSnapshot = {}
                                    result.FaceMatches.forEach(e => {
                                        let snapBoundingBox = e.Face.BoundingBox
                                        let snapshotId = "" +
                                            'Width:' + snapBoundingBox.Width.toFixed(2) +
                                            'Height:' + snapBoundingBox.Height.toFixed(2) +
                                            'Top:' + snapBoundingBox.Top.toFixed(2) +
                                            'Left:' + snapBoundingBox.Left.toFixed(2) +
                                            "";
                                        trustFacesObj.faceInSnapshot[snapshotId] = {};
                                        trustFacesObj.faceInSnapshot[snapshotId].face = e;
                                        trustFacesObj.faceInSnapshot[snapshotId].id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
                                        trustFacesObj.faceInSnapshot[snapshotId].trusted = false;

                                        console.log(trustFacesObj.faceInSnapshot)
                                    })
                                }
                                let firstFace = result.FaceMatches[0];
                                let firstFaceBoundingBox = firstFace.Face.BoundingBox;
                                let firstFaceId = "" +
                                    'Width:' + firstFaceBoundingBox.Width.toFixed(2) +
                                    'Height:' + firstFaceBoundingBox.Height.toFixed(2) +
                                    'Top:' + firstFaceBoundingBox.Top.toFixed(2) +
                                    'Left:' + firstFaceBoundingBox.Left.toFixed(2) +
                                    "";
                                let similarity = firstFace.Similarity;
                                if (similarity >= 70) {

                                    let faceCardId = element.name.replace(/\s+/g, "") + Date.now().toString();

                                    trustFacesObj.faceInSnapshot[firstFaceId].face = firstFace;
                                    trustFacesObj.faceInSnapshot[firstFaceId].id = faceCardId;
                                    trustFacesObj.faceInSnapshot[firstFaceId].trusted = true;
                                    trustFacesObj.faceInSnapshot[firstFaceId].info = element;
                                }

                                if (index === array.length - 1) {
                                    Object.keys(trustFacesObj.faceInSnapshot).forEach(key => {
                                        if (trustFacesObj.faceInSnapshot[key].face) {

                                            let Faceobject = trustFacesObj.faceInSnapshot[key];

                                            if (Faceobject.trusted) {

                                                let oldHtml = $('#imgShowBoxFaceDetectPanel').html();
                                                let newHtml = oldHtml + `
                                                    <div id="imgShowBoxFaceDetectCard_${Faceobject.id}" class="card bg-success text-white imgShowBox__faceDetectCard" style="width: 18rem;">
                                                        <div class="card-body">
                                                            <h5 class="card-title">${Faceobject.info.name}</h5>
                                                            <p class="card-text">${Faceobject.info.description}</p>
                                                        </div>
                                                    </div>
                                                `;

                                                $('#imgShowBoxFaceDetectPanel').html(newHtml)

                                            } else {
                                                let oldHtml = $('#imgShowBoxFaceDetectPanel').html();
                                                let newHtml = oldHtml + `
                                                <div id="imgShowBoxFaceDetectCard_${Faceobject.id}" class="card bg-danger text-white imgShowBox__faceDetectCard" style="width: 18rem;">
                                                    <div class="card-body">
                                                        <h5 class="card-title">Unknown Face</h5>
                                                    </div>
                                                </div>
                                                `;

                                                $('#imgShowBoxFaceDetectPanel').html(newHtml)
                                            }
                                        }
                                    })

                                    Object.keys(trustFacesObj.faceInSnapshot).forEach(key => {
                                        if (trustFacesObj.faceInSnapshot[key].face) {
                                            let Faceobject = trustFacesObj.faceInSnapshot[key];
                                            if (Faceobject.trusted) {
                                                faceDetectCardEventListener(`imgShowBoxFaceDetectCard_${Faceobject.id}`, Faceobject.face);
                                            } else {
                                                faceDetectCardEventListener(`imgShowBoxFaceDetectCard_${Faceobject.id}`, Faceobject.face, 'red');
                                            }
                                        }
                                    })
                                }

                            }

                        })
                    });
                }
            })
        });
    });
}

function faceDetectCardEventListener(faceDetectCardId, data, color) {

    $(`#${faceDetectCardId}`).click(function() {
        let imageElement = $('.imgShowBox__img:first');
        let boundingBox = data.Face.BoundingBox;
        let imgShowBoxBoundingBox = $('.imgShowBox__imgBoundingBox');

        color = color || 'yellow';

        imgShowBoxBoundingBox
            .css('width', Math.round(boundingBox.Width * imageElement.width()) + 'px')
            .css('height', Math.round(boundingBox.Height * imageElement.height()) + 'px')
            .css('top', Math.round(boundingBox.Top * imageElement.height()) + 'px')
            .css('left', Math.round(boundingBox.Left * imageElement.width()) + 'px')
            .css('border-color', color)
            .css('opacity', 1);
    })
}