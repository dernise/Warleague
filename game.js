$(document).ready(function() {
  //Setting game windows
  var chat_height = $( window ).height() - 55;
  var chat_left = $( window ).width() - 342;
  var menu_width = $( window ).width();
  $("#chat").css("left", chat_left+ "px");
  $("#chat").css("height", chat_height + "px");
  $("#header").css("width", menu_width + "px");
  //initialise network
  window.socketClient = new Network("realmd.warleague.fr", 8080);
});

$( window ).resize(function() { //Resize chat
  var chat_height = $( window ).height() - 55;
  var chat_left = $( window ).width() - 342;
  var menu_width = $( window ).width();
  $("#chat").css("left", chat_left+ "px");
  $("#chat").css("height", chat_height + "px");
  $("#header").css("width", menu_width + "px");
});

function startGame(){
  $("#header").css("display", "block");
  $("#chat").css("display", "block");
  $("#login-window").hide();
}

function displayRegister(){
  $('#login').hide();  
  $('#register').show();
}

function displayLogin(){
  $('#login').show();  
  $('#register').hide();
}

function login(){
  var username = $('#login-username').val();
  var password = $('#login-password').val();

  if(!username || !password){
    displayError("You must fill all the fields");
    return;
  }

  socketClient.sendLoginMessage(username, password);

  function displayError(error){
    $("#login-messagebox").html("<div class=\"alert-message\" style=\"background-color:#e74c3c;\">" + error + "</div>");
  }
}

function register(){
  var nameRegex = /^[a-zA-Z\-]+$/;
  var emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,4}/;
  var username = $("#register-username").val();
  var password = $("#register-password").val();
  var password_r = $("#register-password_reapeat").val();
  var email = $("#register-email").val();

  if(!nameRegex.test(username)){
      displayError("Username is invalid");
      return;  
  }

  if(!emailRegex.test(email)){
      displayError("Email is invalid");
      return;  
  }

  if(!username || !password || !password_r || !email ){
    displayError("You must fill all the fields");
    return;
  }

  if(password != password_r){
    displayError("Passwords don't match");
    return;
  }

  socketClient.sendRegisterMessage(username, password, email);

  function displayError(error){
    $("#register-messagebox").html("<div class=\"alert-message\" style=\"background-color:#e74c3c;\">" + error + "</div>");
  }
}