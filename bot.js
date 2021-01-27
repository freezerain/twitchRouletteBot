const tmi = require("tmi.js");

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [process.env.CHANNEL_NAME]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

var score = 0;
var minDelay = 5000;
var iterationLeft = 0;
var target = null;
var botMessage = "Роллю!";

// Called every time a message comes in
function onMessageHandler(localTarget, context, msg, self) {
  if (self) {
    return;
  } //Ignore sended from code msg

  //Igrnore by nickname
  if (
    context.username != "freezemydragonheart" &&
    context.username != "streamelements"
  ) {
    return;
  }

  //Ignore by target
  if (
    context.username == "streamelements" &&
    msg.indexOf("freezemydragonheart" == -1)
  ) {
    return;
  }

  //Catch score update messages
  if (
    context.username == "streamelements" &&
    msg.contains("freezemydragonheart")
  ) {
    var tempArr = msg.split(" ");
    score = tempArr[msg.split(" ").indexOf("тебя") + 1];
    console.log("Обновленние очков: " + score);
  }

  //Trimm and splitt message
  var trimmedMsg = msg.trim();
  var msgArr = trimmedMsg.split(" ");
  //Check for commands
  if (msgArr.length > 0 && msgArr[0].includes("!startRolling")) {
    //First argument is iteration count
    if (msgArr.length > 1 && /^\d+$/.test(msgArr[1])) {
      iterationLeft = msgArr[1];
    } else {
      iterationLeft = 10;
    }

    //Second Argument is roll message argument
    if (msgArr.length > 2) {
      botMessage = "!roll " + msgArr[2];
    } else {
      botMessage = "!roll 50%";
    }

    //Third argument is message delays
    if (msgArr.length > 3 && /^\d+$/.test(msgArr[3])) {
      minDelay = msgArr[3] * 1000;
    } else {
      minDelay = 65000;
    }

    //Set stream/message target
    if (target === null) target = localTarget;

    //First iteration sends instantly
    client.say(target, botMessage);
    iterationLeft--;
    //Recursive delayed message send call
    myLoop();
  }
  //Stop rolling command
  else if (msgArr.length > 0 && msgArr[0].includes("!stopRolling")) {
    console.log("Stopping roll");
    iterationLeft = 0;
  }
  //Unknown command exit
  else {
    console.log("msg invalid: " + msg);
  }
}

//Recursive delayed message sent to chat
function myLoop() {
  if (iterationLeft > 0) {
    setTimeout(function() {
      client.say(target, botMessage);
      console.log(iterationLeft);
      iterationLeft = iterationLeft - 1;
      myLoop();
    }, minDelay);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
