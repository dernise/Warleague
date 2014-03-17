$(document).ready(function() {
  //initialise network
  window.socketClient = new Network("realmd.warleague.fr", 8080);
  //initialise UI
  window.uiManager = new WarleagueUI();
  window.uiManager.initUI();
});

/*
 * On resize, correct de height of the chat and width of the navbar
 */
$( window ).resize(function() { //Resize chat
    var chat_height = $( window ).height() - 55;
    var chat_left = $( window ).width() - 342;
    var menu_width = $( window ).width();
    var chat_messages_height = $(window).height() - 115;
    $("#chat").css("left", chat_left+ "px");
    $("#chat").css("height", chat_height + "px");
    $("#chat-messages").css("height", chat_messages_height +"px");
    $("#header").css("width", menu_width + "px");
});