var Network = function(ip, port){
  this.host = "ws://"+ip+":"+port;
  this.socket = new WebSocket(this.host);
  this.socket.binaryType = "arraybuffer";
  var ByteBuffer = dcodeIO.ByteBuffer;
  
  /* 
   * When connected to the server
   */
  this.socket.onopen = function(){
    console.log('Connected to the WebSocket server');
	uiManager.autologin(); // When the network is on, check the cookie
  };

  /* 
   * When a message is received
   */
  this.socket.onmessage = function(e){
    var bytearray = new Uint8Array(e.data);
    var reader = ByteBuffer.wrap(bytearray);
    var opcode = reader.readUint16();  

    switch(opcode)
    {
      case 2: handleLoginAnswer(reader); break; //Login
      case 4: handleMessageAnswer(reader); break; //New message in chat box
      case 6: handleRegisterAnswer(reader); break; //Register
      case 7: handleCreatePlayerMessage(reader); break; //Create new player in game
      case 9: handlePlayerUpdatePos(reader); break; //Update a player's position
      default:
        alert("Received a wrong packet")
    }
  };

  /*
   * Senders
   * Used to send packets to the server 
   */

  /* 
   * Sends the register message
   */
  this.sendRegisterMessage = function(accountName, password, email){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt16(3);
    bb.writeCString(accountName);
    bb.writeCString(CryptoJS.SHA1(accountName.toLowerCase() + ":" + password));
    bb.writeCString(email);
    this.socket.send(bb.toArrayBuffer());
  };

  /* 
   * Sends the Login message
   */
  this.sendLoginMessage = function(accountName, password){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt16(1);
    bb.writeCString(accountName);
    bb.writeCString(CryptoJS.SHA1(accountName.toLowerCase() + ":" + password));
    this.socket.send(bb.toArrayBuffer());  
  };

  /* 
   * Sends the chat message
   */
  this.sendMessage = function(message){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt16(3);
    bb.writeCString(message);
    this.socket.send(bb.toArrayBuffer()); 
  };


  this.sendPosition = function(x, y){
    var bb = new ByteBuffer();
    bb.BE();
    bb.writeInt16(8);
    bb.writeDouble(x);
    bb.writeDouble(y);
    this.socket.send(bb.toArrayBuffer());
  }
  /*
   * Handlers
   * Used to parse the packets from the server
   */

  /* 
   * Handle the message answer 
   */
  var handleMessageAnswer = function(reader){
    var text = reader.readCString();
    window.uiManager.appendMessage(text);
  };

  /* 
   * Handle the message answer 
   */
  var handleCreatePlayerMessage = function(reader){
    var playerId = reader.readUint32();
    var playerName = reader.readCString();
    window.game.addPlayer(playerId, playerName);
  };

  /**
   * Handle a player position change
   */
  var handlePlayerUpdatePos = function(reader){
    var playerId = reader.readUint32(),
        positionX = reader.readDouble(),
        positionY = reader.readDouble();

    window.game.updatePos(playerId, positionX, positionY);
    
  };

  /*
   * Handle the login answer
   */
  var handleLoginAnswer = function(reader){
    var result = reader.readUint16();
    switch(result){
      case 0: displayError("Username or password is invalid"); break; 
      case 1: window.uiManager.startGame(); break;
    }   

    function displayError(error){
      $("#login-messagebox").html("<div class=\"alert-message\" style=\"background-color:#e74c3c;\">" + error + "</div>");
    } 
  };

  /*
   * Handle the register answer
   */
  var handleRegisterAnswer = function(reader){
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