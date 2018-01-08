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
    db.write("users", "id="+id+" username="+db.en(username));
    msg.reply("Registered!")
  }
});

client.login('token');      
