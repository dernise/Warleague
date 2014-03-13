$(document).ready(function() {
  //initialise network
  window.socketClient = new Network("realmd.warleague.fr", 8080);
});

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
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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