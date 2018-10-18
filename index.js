// Calling the package
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const moment = require('moment') // the moment package. to make this work u need to run "npm install moment --save 
const ms = require("ms") // npm install ms -s
const SQLite = require("better-sqlite3");
const sql = new SQLite('./storage/scores.sqlite');

// Some stuff dw about it
const workCooldown = new Set();

// json files
var userData = JSON.parse(fs.readFileSync("./storage/userData.json", "utf8"))

// Listener Event: Bot Launched
bot.on('ready', () => {
    console.log('Power Level Stabilised.') // Runs when the bot is launched

    //const botchat = bot.channels.get("469992574791319552")
    //const generalchat = bot.channels.get("469490700845580298")
    //generalchat.send(`Topic of the week: `)
    
    
    bot.user.setActivity("prefix ` | Blocks Awakens")
    // SQLITE stuff
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, money INTEGER, sp INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

});

//event listener: join/leave a voice channel
bot.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel
  let ivc = newMember.guild.roles.find("name", "In Voice Call");
  
  if(oldUserChannel === undefined && newUserChannel !== undefined) { // User Joins a voice channel
        newMember.addRole(ivc).catch(console.error);
  } else if(newUserChannel === undefined) { // User leaves a voice channel
    newMember.removeRole(ivc).catch(console.error);
  }
});


// event listener: new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'pending');
    const channelinfo = member.guild.channels.find('name', 'info');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome ${member}! You can apply to get whitelisted, by clicking the link provided here: ${channelinfo}. Your answers must be a paragraph long. Good luck! `);
    
  });

// Event listener: Message Received ( This will run every time a message is received)
bot.on('message', async message => {

    // Variables
    let sender = message.author; // The person who sent the message
    let msg = message.content.toLowerCase();
    let prefix = '`' // The text before commands
    if (bot.user.id === sender.id) { return }
    let nick = sender.username
    let Owner = message.guild.roles.find('name', "Owner")    

    //json stuff
    if (!userData[sender.id]) userData[sender.id] = {}
    if (!userData[sender.id].money) userData[sender.id].money = 0;
    if (!userData[sender.id].SP) userData[sender.id].SP = 0;
    if (!userData[sender.id].username) userData[sender.id].username = sender.username;

    
    fs.writeFile('./storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
    });

    // SQLITE
    if (!score) {
      score = {
        id: `${message.guild.id}-${message.author.id}`,
        user: message.author.id,
        guild: message.guild.id,
        money: 0,
        sp: 0
      }
    }
    
    // commands

    // Ping / Pong command
    if (msg === prefix + 'ping') {
      if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) {
        let m = await message.channel.send("Ping?");
        m.edit(`Pong. Latency: ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
      } else {return}
    }
    
    // leaderboard
    if (msg === prefix + "lb" || msg === prefix + "leaderboard"){
        let lb = new Discord.RichEmbed()
        .setDescription('**___Leaderboard___**')
        .setColor(0x15f153)
        message.channel.send(lb)
    };
    
    // Delete msgs
    if (msg.split(" ")[0] === prefix + "mdelete"){
        if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) {
            let args = msg.split(" ").slice(1)
            let num = Number(args[0]);
            if (num > 100 || num < 2){
                return message.reply('Please enter a number between 2 and 100')
            }
            message.channel.bulkDelete(num).then(() => {
            message.channel.send("Deleted " + num + " messages.").then(msg => msg.delete(3000));
            });
        }else {return}
    };

    //Single Poll
    if (msg.startsWith("poll:")) {
      if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) { 
            let m = await message.react("👍")
            let m2 = await message.react("👎")
            let m3 = await message.react("🤷")
        } else {return};
      };

    //4poll
    if (msg.startsWith("4poll:")) {
      if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) { 
            let m = await message.react("🤔")
            let m2 = await message.react("👉")
            let m3 = await message.react("👌")
            let m4 = await message.react("🖕")
        } else {return};
      };

    //get ping role
    if (msg === prefix + "pingrole"){
        message.member.addRole('501888773710282755');
        await message.reply('I have given you the ping role!')
    };
    
    //remove ping role
    if (msg === prefix + "rpingrole"){
        message.member.removeRole('501888773710282755');
        await message.reply('I have removed the ping role from you!')
    };

    //timed message
    //const generalchat = bot.channels.get("469490700845580298")
    //let timer = bot.setInterval(timedMessage, /*172800000*/10800000);
    //let timer2 = bot.setInterval(timedMessage2, 300000);
    
    //function timedMessage() {
      //generalchat.send(`Topic of the week: `)
      //.catch(console.error)};


    //bot info command
    if (msg === prefix + "botinfo") {
        let bicon = bot.user.displayAvatarURL

        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Information")
        .setColor(0x15f153)
        .setThumbnail(bicon)
        .addField("Bot Name", bot.user.username)
        .addField("Created At", bot.user.createdAt)

        message.channel.send(botembed)
    };


    //serverinfo command
    if (msg === prefix + "serverinfo") {
      let sicon = message.guild.iconURL
        
        let serverembed = new Discord.RichEmbed()
        .setDescription("__**Server Information**__")
        .setColor(0x15f153)
        .setThumbnail(sicon)
        .addField("Server Name", message.guild.name)
        .addField("Created On", message.guild.createdAt)
        .addField("Total Members", message.guild.memberCount)
        .addField("Emoji", message.guild.emojis + "*work in progress*")

        await message.channel.send(serverembed)

    };

    //member info
    if (msg.split(" ")[0] === prefix + "member") {
      //ex `member @Rinkky
      let args = msg.split(" ").slice(1)
      let rMember = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
      let micon = rMember.displayAvatarURL

        if(!rMember) 
          return message.reply("Who dat user? I dunno him.")

          let memberembed = new Discord.RichEmbed()
          .setDescription("__**Member Information**__")
          .setColor(0x15f153)
          .setThumbnail(micon)
          .addField("Name", rMember)
          .addField("ID", rMember.id)
          .addField("Joined at", rMember.joinedAt)
  
          await message.channel.send(memberembed)

    };

    //role info
    if (msg.split(" ")[0] === prefix + "roleinfo") {
          //ex `roleinfo @owner
          //let args = msg.split(" ").slice(1)
          let rRole = message.mentions.roles.first()
                                           
            if(!rRole)
              return message.reply("Who dat role? I cant find it.")

              let roleembed = new Discord.RichEmbed()
              .setDescription("__**Role Information**__")
              .setColor(0x15f153)
              .addField("Name", rRole)
              .addField("ID", rRole.id)
              .addField("Members with this role:", message.guild.roles.get(rRole.id).members.map(m=>m.user.tag).join('\n'));
              await message.channel.send(roleembed)

        }; 


    //reports
    if (msg.split(" ")[0] === prefix + "report") {
      //ex `report @Rinkky racist
      let args = msg.split(" ").slice(1)
      let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
      let rreason = args.join(" ").slice(22)
      let reportschannel = message.guild.channels.find(`name`, "staff")

        message.delete()

        if(!rUser) return message.reply("Da user you searchin, is unavailable, please report later.")
        if(!rreason) return message.reply("Where da reason? i dont see any.")

        let reportEmbed = new Discord.RichEmbed()
        .setDescription("Report-ing for duty!")
        .setColor(0xe0782b)
        .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
        .addField("Reported By", `${sender} with ID: ${sender.id}`)
        .addField("Reason", rreason)
        .addField("Channel", message.channel)
        .addField("Reported At", message.createdAt)
        

        reportschannel.send(reportEmbed)
        message.guild.members.get(sender.id)
        .createDM()
              .then(dm => {
                dm.send({embed: {
                  color: 0x15f153,
                  title: "User Reported" ,
                 description: `You successfully reported ${rUser}. \nReason:${rreason} \n\n Thank you for your help, we'll investigate.`,
                 timestamp: new Date(),
                  footer: {
                  icon_url: "186487324517859328".avatarURL,
                  text: "Any intentionally misleading reports will not be tolorated"
                  }
                }})
              })
    };

    //GAMBLING SHIT

    // bal access
    if (msg === prefix + 'bal') {
        let m = await message.channel.send({embed: {
            color: 0x05ff00,
            title: "Your ~~life~~ balance",
            description: `${userData[sender.id].money} insert super secret emoji here \n${userData[sender.id].SP} Event Points`,
            timestamp: new Date(),
            footer: {
              icon_url: sender.avatarURL
            }
          }
        })
    };


    //coinguess game

    const coin =  Math.floor((Math.random() * 2) + 1);

    if (msg === prefix + 'coinflip') {
        let m = await message.channel.send("**Flips a coin:** \n Commands: __\`guess D__ - __\`guess N__")
    };

          //Diamonds

        if (msg === prefix + 'guess d' || msg === prefix + 'g d'  ) {
          if (coin <= 1) {
            let m = await message.reply('The coin landed on Diamonds, You won!',// {files: ["Storage/images/diamond.png"]}) //128x128 images are ideal
            userData[sender.id].money = (userData[sender.id].money+300))
            let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)
          } else if (coin >= 2) {
            let m = await message.reply("The coin landed on Nuggets, you lost.",// { files: ["Storage/images/nugget.png"]})
            userData[sender.id].money = (userData[sender.id].money-150))
            let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)
          }
        };
        
          //Nuggets

        if (msg === prefix + 'guess n' || msg === prefix + 'g n' ) {
          if (coin <= 1) {
            let m = await message.reply('The coin landed on Nuggets, You won!',// {files: ["Storage/images/nugget.png"]})
            userData[sender.id].money = (userData[sender.id].money+300))
            let m1 = await message.channel.send(` You now have: ${userData[sender.id].money} insert super secret emoji here`)
          } else if (coin >= 2) {
            let m = await message.reply("The coin landed on Diamonds, you lost. ",// {files: ["Storage/images/diamond.png"]})
            userData[sender.id].money = (userData[sender.id].money-150))
            let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)
          }
        };
    
    // Dice roll guess
    const roll =  Math.floor((Math.random() * 6) + 1);
    if(msg.split(" ")[0] === prefix + "diceroll"){
        let args = msg.split(" ").slice(1)
        if(args >=1 && args <= 6){
            if(args == roll + 1 || args == roll - 1 || args == roll){
                let m = await message.reply("You guessed in a range of 1 and were correct!",
                userData[sender.id].money = (userData[sender.id].money+150))
                let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)
            }else{
                let m = await message.reply("You guessed in a range of 1 and were incorrect!",
                userData[sender.id].money = (userData[sender.id].money-50))
                let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)
            }
        }else{
            return message.reply('Please enter a number between 1 and 6')
        }
       };
    
    // Work
    if(msg === prefix + "work"){
        if (workCooldown.has(sender.id)) {
               return message.reply("You must wait 10 minutes before working again.");
        } else {
            let money = Math.floor((Math.random() * 801) + 200);
            let m = await message.reply("You worked so hard and received " + money,
            userData[sender.id].money = (userData[sender.id].money+money))
            let m1 = await message.channel.send(`You now have: ${userData[sender.id].money} insert super secret emoji here`)

            workCooldown.add(sender.id);
            setTimeout(() => {
              workCooldown.delete(sender.id);
            }, 600000);
        }
    };
    // Add money
    /*if(msg.split(" ")[0] === prefix + "addmoney"){
        if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) {
            let args = msg.split(" ").slice(1)
            let rUser = message.mentions.users.first()
            if(!rUser){
               return message.reply('Who is this person?')
            }
            let userId = rUser.id
            let addedmoney = Number(args[1]);
            if(addedmoney > 1){
                let m = await message.reply("You added " + addedmoney + " to " + rUser,
                userData[userId].money = (userData[userId].money + addedmoney))
                let m1 = await message.channel.send(rUser + ` now has ${userData[userId].money} insert super secret emoji here`)
            }else{
                return message.reply('Please enter a number greater than 1')
            }
        }else {return}
    };*/
    
    // Remove money
    if(msg.split(" ")[0] === prefix + "removemoney"){
        if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) {
            let args = msg.split(" ").slice(1)
            let rUser = message.mentions.users.first()
            if(!rUser){
               return message.reply('Who is this person?')
            }
            let userId = rUser.id
            let addedmoney = Number(args[1]);
            if(addedmoney > 1){
                let m = await message.reply("You removed " + addedmoney + " from " + rUser,
                userData[userId].money = (userData[userId].money - addedmoney))
                let m1 = await message.channel.send(rUser + ` now has ${userData[userId].money} insert super secret emoji here`)
            }else{
                return message.reply('Please enter a number greater than 1')
            }
        }else {return}
    };

    
    if(msg.split(" ")[0] === prefix + "addmoney") {
      let args = msg.split(" ").slice(1)
      // Limited to guild owner - adjust to your own preference!
      if(!sender.id === message.guild.owner || sender.id === "186487324517859328") return message.reply("You're not the boss of me, you can't do that!");

      const user = message.mentions.users.first() || bot.users.get(args[0]);
      if(!user) return message.reply("You must mention someone or give their ID!");

      const moneyToAdd = Number(args[1]);
      if(!moneyToAdd) return message.reply("You didn't tell me how much to give...")

      // Get their current points.
      let userscore = bot.getScore.get(user.id, message.guild.id);
      // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
      if (!userscore) {
        userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, money: 0, sp: 0 }
      }
      userscore.money += moneyToAdd;

      // And we save it!
      bot.setScore.run(userscore);

      return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
    }
 
if(command === "leaderboard") {
  const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
 
    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard")
    .setAuthor(bot.user.username, bot.user.avatarURL)
    .setDescription("Our top 10 points leaders!")
    .setColor(0x00AE86);
 
  for(const data of top10) {
    embed.addField(bot.users.get(data.user).tag, `${data.points} points (level ${data.level})`);
  }
  return message.channel.send({embed});
}
    
    //8ball

    if (msg === prefix + "8ball") {
        let m = await message.reply('give me a question >:(')
    } else if (msg.startsWith(prefix + "8ball")) {
        var sayings = ["Of course not.",
                      "I believe it is true.",
                      "Can you repeat the question? i wasnt listening",
                      "Dont ask stupid things",
                      "Out of all the things you could ask.."];

        var results =  Math.floor((Math.random() * sayings.length) + 0)
        let m = await message.reply(sayings[results]);
    } else if (msg.startsWith(prefix + "8ball") && msg.includes("event"||"event planning"||"alien"||"ufo")) {
        if (sender.id !== ["186487324517859328","376950284968001556","353782817777385472"]) {
          message.send("No leaks for future events? Open your eyes, chinese man. Rinkky Teases thinks all day and night. He cant keep his mounth shut.")
        }
      };


      //DM forwarding - draft
      if (message.channel.type == 'dm'){ //checks for DM
        let dmName = `${nick}DM`
        staffchat = member.guild.channels.find('name', 'staff');

        message.staffchat.send({embed: { //forwards DM to staff chat
          color: 0xff0000,
          title: "DM Forwarded" ,
         description: dm.content ,
         timestamp: new Date(),
          footer: {
          icon_url: sender.avatarURL,
          text: `by ${dmName}`
          }
        }})
      };


    //EVAL! DO NOT FUCKING TOUCH THAT SHIT IF YOU ARE NOT RINKKY!

    if (msg.startsWith(prefix + "eval")) {
      if(sender.id !== "186487324517859328") return;
      const args = message.content.split(" ").slice(1);
      try {
        const code = args.join(" ");
        let evaled = eval(code);
  
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
  
        message.channel.send(clean(evaled), {code:"xl"});
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }


    //stopping the bot
    if (msg === prefix + 'stop') {
      if(sender.id === "186487324517859328" || message.member.roles.has(Owner.id)) {
        process.exit(1)
      } else {return}
    };

}); //the end of bot.on ------------------------------


/*one time event function
  function onetime(node, type, callback) {
    //create event
    node.addEventListener(type, function(e) {
      //remove event
      e.target.removeEventListener(e, type, arguments.callee)
        //call gandler
        return callback(e)
    })
  } draaaaaft*/

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

//  Login

// the bot.token('token')
bot.login(process.env.token);
