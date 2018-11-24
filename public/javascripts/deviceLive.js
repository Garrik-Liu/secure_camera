var videoCanvas = document.getElementById("video-canvas");
var url = "ws://35.243.158.28:3000";
new JSMpeg.Player(url, { canvas: videoCanvas });

$('#deviceSwitch').on('click', function() {
    socket.emit('toggle device');
})

socket.on('update device status', function(data) {
    if (data === 'off') {
        $('#deviceSwitch').html('TURN OFF');
    } else if (data === 'on') {
        $('#deviceSwitch').html('TURN ON');
    }
})