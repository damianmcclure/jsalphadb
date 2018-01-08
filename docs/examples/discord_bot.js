const Discord = require("discord.js");
const client = new Discord.Client();

var key = "Discord";
var ext = ".4db";

const jsAlphaDB = require("jsalphadb");
const db = new jsAlphaDB(key, ext);

client.on('ready', () => {
  db.create("users");
});

client.on('message', msg => {
  if(msg.content.startsWith(".register"){
    var args = message.content.split(" ");
    var username = args[1];
    var id = message.author.id;
    // Will add them to the database.
    db.write("users", "id="+id+" username="+db.en(username));
    msg.reply("Registered!")
  }
          
  if(msg.content.startsWith(".verify"){
    var id = message.author.id;
    var users = db.read("users", "id="+id, "id username");
    for(var user of users){
      var original_user = db.de(db.column(user, 1); 
      msg.reply("Found one user: "+original_user);
    }
  }
});

client.login('token');      
