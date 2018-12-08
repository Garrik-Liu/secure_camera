$(document).ready(function() {
  var deviceMesBox = $(".deviceMesBox__container--close:first");
  var deviceMesBoxCloseBtn = $(
    ".deviceMesBox__container--close .closeBtn:first"
  );

  $(".deviceList__deviceBtn").each(function(index) {
    $(this).click(function() {
      toggleSideColumn(deviceMesBox, "open");
      $("#deviceBtnMesCount .mesCount__number").html("0");
      $("#deviceBtnMesCount").css("opacity", 0);
    });
  });

  deviceMesBoxCloseBtn.click(function() {
    toggleSideColumn(deviceMesBox, "close");
  });

  function toggleSideColumn(sideColumn, state) {
    if (state === "open") {
      sideColumn
        .toggleClass("deviceMesBox__container--close")
        .toggleClass("deviceMesBox__container");
    } else if (state === "close") {
      sideColumn
        .toggleClass("deviceMesBox__container")
        .toggleClass("deviceMesBox__container--close");
    }
  }
});
