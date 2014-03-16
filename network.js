var Network = function(ip, port){
  this.host = "ws://"+ip+":"+port;
  this.socket = new WebSocket(this.host);
  this.socket.binaryType = "arraybuffer";
  var ByteBuffer = dcodeIO.ByteBuffer;
  
  this.socket.onopen = function(){
    console.log('Connected to the WebSocket server');
  };

  this.socket.onmessage = function(e){
    var bytearray = new Uint8Array(e.data);
    switch(bytearray[0])
    {
      case 2: handleLoginAnswer(bytearray); break;
      case 4: handleRegisterAnswer(bytearray); break;
      default:
        alert("Received a wrong packet")
    }
  };

  this.sendRegisterMessage = function(accountName, password, email){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt8(3);
    bb.writeCString(accountName);
    bb.writeCString(CryptoJS.SHA1(accountName.toLowerCase() + ":" + password));
    bb.writeCString(email);
    this.socket.send(bb.toArrayBuffer());
  };

  this.sendLoginMessage = function(accountName, password){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt8(1);
    bb.writeCString(accountName);
    bb.writeCString(CryptoJS.SHA1(accountName.toLowerCase() + ":" + password));
    this.socket.send(bb.toArrayBuffer());  
  };

  var handleLoginAnswer = function(packet){
    var reader = ByteBuffer.wrap(packet);
    var opcode = reader.readUint8();  

    if(opcode != 2)
      return;

    var result = reader.readUint8();
    switch(result){
      case 1: window.startGame(); break;
      case 2: displayError("Username or password is invalid"); break;
    }   

    function displayError(error){
      $("#login-messagebox").html("<div class=\"alert-message\" style=\"background-color:#e74c3c;\">" + error + "</div>");
    } 
  };

  var handleRegisterAnswer = function(packet){
    var reader = ByteBuffer.wrap(packet);
    var opcode = reader.readUint8();
    
    if(opcode != 4)
      return;

    var result = reader.readUint8();
    switch(result){
      case 1: displayValidate("Sucessfully registered"); break;
      case 2: displayError("Username is already taken"); break;
      case 3: displayError("Email is already taken"); break;
    }

    function displayValidate(message){
      $("#register-messagebox").html("<div class=\"alert-message\" style=\"background-color:#27ae60;\">" + message + "</div>");
    }

    function displayError(error){
      $("#register-messagebox").html("<div class=\"alert-message\" style=\"background-color:#e74c3c;\">" + error + "</div>");
    }
  };
}