$(document).ready(function() {
    var canvas = document.getElementById("video-canvas");
    var url = "ws://35.243.158.28:3000";
    new JSMpeg.Player(url, { canvas: canvas });
});