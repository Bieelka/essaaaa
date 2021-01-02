const express = require("express");
const app = express();
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
const { Commander } = require("teamspeak-commander");
const { get } = require("snekfetch");

//Podesavanja
const host                = "ts3.elitegaming.me";
const port                = 9987;
const queryport           = 10011;
const username            = "serveradmin";
const password            = "LR+hR70b";
const botname             = "ELITE BOT";

const debug               = false;  //DEBUG LOG
const error               = false;  //ERROR LOG
const info                = true;   //INFO LOG

const TryReconnect        = true;
const WelcomeMsg          = true;
const StaffOnline         = true;
const UsersOnline         = true;

const botprefix           = "-";
const OnlineChannelID     = 58;
const StaffChannelID      = 182;
const StaffGroups         = ["9","30","19"]

const SteamAPI            = "521186ABF3F9902433A9F7BFBC7BFC72";
const ClashOfClansAPI     = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkwMDE5NzdhLThlYjAtNDdjNy05MDQ0LTA3YzNjM2I0ODhkMiIsImlhdCI6MTYwOTYyNDY1MCwic3ViIjoiZGV2ZWxvcGVyLzZhYmQ1N2EyLTZmZGQtZDU1YS1kMjBjLTFkYzQ1NzE0NzRkNSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjM0LjIzOS4xMjguMTc3Il0sInR5cGUiOiJjbGllbnQifV19.vyHJtyrZ2TWShdyXZNmoLID9dtVDLgftrMQFSRShDLLH9ODUeE7aAJu4l3aYdWsjOOF8ukSWuFCJIJcaWqnpwA";
const FortniteTrackerAPI  = "124bcb91-f1ed-4021-9209-1ade04568f3a";



const teamspeak = new TeamSpeak({
  host: host,
  queryport: queryport,
  serverport: port,
  username: username,
  password: password,
  nickname: botname
})

teamspeak.on("ready", async function() {
   log("BOT USPESNO POVEZAN NA TS3!", 2);
   if(UsersOnline==true) {
   await updateOnline(OnlineChannelID);
   }
   if(StaffOnline==true){
   await updateStaff(StaffChannelID);
   }
});


teamspeak.on("clientconnect", async (client) => {
  await sendWelcome(client);
  if(UsersOnline==true) {
  await updateOnline(OnlineChannelID);
  }
  if(StaffOnline==true){
  await updateStaff(StaffChannelID);
  }
});

teamspeak.on("clientdisconnect", async () => {
  if(UsersOnline==true) {
  await updateOnline(OnlineChannelID);
  }
  if(StaffOnline==true){
  await updateStaff(StaffChannelID);
  }
});

teamspeak.on("close", async () => {
    if(TryReconnect==true)
    log("RECONNECT: Pokusavam da se povezem na TS3...", 2)
    await teamspeak.reconnect(-1, 1000)
    log("RECONNECT: Uspešno!", 2)
});

teamspeak.on("error", (error) => {
  log(error, 1);
});

function log(msg, type) {
  if(debug==true && type==0) {
  console.log("DEBUG: " + msg)
  } else if (error==true && type==1) {
      console.log("ERROR: " + msg)
  } else if (info==true && type==2) {
      console.log("INFO: " + msg)
  }
};

async function sendWelcome(client) {
  await teamspeak.sendTextMessage(client.client.clid, 1,
    `\n\n    Welcome ` + client.client.propcache.clientNickname + `\n` + 
    `    Your first connection was on [b]`+new Date(client.client.propcache.clientCreated * 1000)+`[/b].
    Your last connection was on [b]`+ new Date(client.client.propcache.clientLastconnected * 1000) + `[/b].
    Your unique id is [b]"`+ client.client.propcache.clientUniqueIdentifier +`"[/b].
    Your client version is [b]`+ client.client.propcache.clientVersion +` (`+ client.client.propcache.clientPlatform+`)[/b].
    Your ip adress is [b]`+ client.client.propcache.connectionClientIp +` (`+ client.client.propcache.clientCountry +`)[/b].\n
    If you have any questions/remarks/suggestions/compliments join in [b]"Need Help?"[/b] channel and wait for administrator.`)
  .catch(e => {
      log(e, 1);
  });
};

async function updateOnline(channelid) {
  const clients = await teamspeak.clientList({})
  var TotalClients = clients.length;
  var replace = "[cspacer]ONLINE: "+TotalClients;
  await teamspeak.channelInfo(channelid).then(currentname => {
  if(currentname.channelName!=replace) {
  teamspeak.channelEdit(channelid, {channelName: replace});
  }
  })
};

async function updateStaff(channelid) {
  const clients = await teamspeak.clientList()
  const count = clients.filter(client => StaffGroups.some(g => client.servergroups.includes(g)))
  var TotalStaff = count.length;
  var replace = "[cspacer]STAFF ONLINE: "+TotalStaff;
  await teamspeak.channelInfo(channelid).then(currentname => {
  if(currentname.channelName!=replace) {
  teamspeak.channelEdit(channelid, {channelName: replace});
  }
  })
};

teamspeak.on("textmessage", message => {
  if(!message.msg.startsWith(botprefix)) return;
  const args = message.msg.slice(botprefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if(commandName=="slots")
  {
    slots(args[0], message.invoker.clid);
  } else if(commandName=="8ball") {
    ball(args, message.invoker.clid);
  } else if(commandName=="rps") {
    rps(args[0], message.invoker.clid);
  } else if(commandName=="csgo") {
    csgo(args[0], message.invoker.clid);
  } else if(commandName=="coc") {
    coc(args[0], message.invoker.clid);
  } else if(commandName=="fortnite") {
    fortnite(args[0], args[1], message.invoker.clid);
  }
});

async function fortnite(username, platform, user) {
  const data = await get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username)}`)
            .set("TRN-Api-Key", FortniteTrackerAPI)
            .catch(e => {
                log(e,1)
            });


                await teamspeak.sendTextMessage(user, 1, `❯ **Epic Username:** ${data.body.epicUserHandle}` + "\n"
               + `❯ Score:** ${data.body.lifeTimeStats.find(a => a.key === "Score") ? data.body.lifeTimeStats.find(a => a.key === "Score").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Matches Played:** ${data.body.lifeTimeStats.find(a => a.key === "Matches Played") ? data.body.lifeTimeStats.find(a => a.key === "Matches Played").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Kills:** ${data.body.lifeTimeStats.find(a => a.key === "Kills") ? data.body.lifeTimeStats.find(a => a.key === "Kills").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Wins: ${data.body.lifeTimeStats.find(a => a.key === "Wins") ? data.body.lifeTimeStats.find(a => a.key === "Wins").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ K/D:** ${data.body.lifeTimeStats.find(a => a.key === "K/d") ? data.body.lifeTimeStats.find(a => a.key === "K/d").value : "N/A"}`+ "\n"
               + `❯ Top 3s:** ${data.body.lifeTimeStats.find(a => a.key === "Top 3s") ? data.body.lifeTimeStats.find(a => a.key === "Top 3s").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Platform:** ${data.body.platformNameLong}`);
};

async function csgo(username, user) {

        const userData = await get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`)
            .query({ key: SteamAPI, vanityurl: username })
            .catch(e => {
                log(e,1);
            });

        const steamID = userData.body.response.steamid;

        const userStats = await get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/`)
            .query({ key: SteamAPI, appid: 730, steamid: steamID })
            .catch(e => {
                log(e,1);
            });

        const { stats } = userStats.body.playerstats;
  
           await teamspeak.sendTextMessage(user, 1, "\n❯ Steam Username: " + username + "\n"
           + "❯ KDR: " + (stats ? stats.find(a => a.name === "total_kills").value / stats.find(a => a.name === "total_deaths").value : 0).toFixed(2) + "\n"
           + "❯ Total Kills: " + `${stats.find(a => a.name === "total_kills") ? stats.find(a => a.name === "total_kills").value.toLocaleString() : 0}` + "\n"
           + "❯ Total Deaths: " + `${stats.find(a => a.name === "total_deaths") ? stats.find(a => a.name === "total_deaths").value.toLocaleString() : 0}` + "\n"
           + "❯ Total Wins: " +  `${stats.find(a => a.name === "total_wins") ? stats.find(a => a.name === "total_wins").value.toLocaleString() : 0}` + "\n"
           + "❯ Total MVPs: " + `${stats.find(a => a.name === "total_mvps") ? stats.find(a => a.name === "total_mvps").value.toLocaleString() : 0}` + "\n"
           + "❯ Time Played (Not Idle): " + `${stats ? (stats.find(a => a.name === "total_time_played").value / 60 / 60).toFixed(2) : 0} Hour(s)` + "\n"
           + "❯ Knife Kills: " + `${stats.find(a => a.name === "total_kills_knife") ? stats.find(a => a.name === "total_kills_knife").value.toLocaleString() : 0}`);
};

async function coc(tag, user) {
          const data = await get(`https://api.clashofclans.com/v1/players/${encodeURIComponent(tag.toUpperCase().replace(/O/g, "0"))}`)
            .set({ Accept: "application/json", Authorization: ClashOfClansAPI })
            .catch(error => {
                log(error, 1)
            });

        const playerData = data.body;


        await teamspeak.sendTextMessage(user, 1, "\n❯ League: " + `${playerData.league ? playerData.league.name : "N/A"}` + "\n"
            + "❯ Trophies: " + `${playerData.trophies}` + "\n"
            + "❯ War Stars: " + `${playerData.warStars}` + "\n"
            + "❯ Best Trophies: " + `${playerData.bestTrophies}` + "\n");
  
        let troopLevels = "", spellLevels = "", heroLevels = "";

        playerData.troops.forEach(troop => troopLevels += `${troop.name}: ${troop.level} ${troop.level === troop.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (troopLevels) await teamspeak.sendTextMessage(user, 1, "❯ Troop Levels: " + troopLevels);

        playerData.spells.forEach(spell => spellLevels += `${spell.name}: ${spell.level} ${spell.level === spell.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (spellLevels) await teamspeak.sendTextMessage(user, 1, "❯ Spell Levels: "+ spellLevels);

        playerData.heroes.forEach(hero => heroLevels += `${hero.name}: ${hero.level} ${hero.level === hero.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (heroLevels) await teamspeak.sendTextMessage(user, 1, "❯ Hero Levels: " + heroLevels);
};

function rps(move, user) {
        const choices = ["rock", "paper", "scissors"];

        const outcome = choices[Math.floor(Math.random() * choices.length)];
        const choice = move.toLowerCase();
        if (choice === "rock") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! That's a tie!");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! I win, you loose!");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "Scissors! No! You won...");
        } else if (choice === "paper") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! No! You won...");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! Yeah! That's a tie!");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "***Scissors! I win, you loose!");
        } else if (choice === "scissors") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! I win, you loose!");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! No! You won...");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "***Scissors! Yeah! That's a tie!");
        } else {
              teamspeak.sendTextMessage(user, 1, "Wrong argument you can use: rock, paper, scissors!");
        }
};

function ball(question, user) {
  const answers = [
    "Maybe.", "Certainly not.", "I hope so.", "Not in your wildest dreams.",
    "There is a good chance.", "Quite likely.", "I think so.",
    "I hope not.", "I hope so.", "Never!", "Fuhgeddaboudit.",
    "Ahaha! Really?!?", "Pfft.", "Sorry, bucko.",
    "Hell, yes.", "Hell to the no.", "The future is bleak.",
    "The future is uncertain.", "I would rather not say.", "Who cares?",
    "Possibly.", "Never, ever, ever.", "There is a small chance.", "Yes!"];
  
    teamspeak.sendTextMessage(user, 1, `🎱 ${answers[Math.floor(Math.random() * answers.length)]}`)
};

function slots(bet, user) {
    const slots = ["🍔", "🍟", "🌭", "🍕", "🌮", "🍘", "🍫", "🍿", "🍩"];
    const Mone = slots[Math.floor(Math.random() * slots.length)];
    const Mtwo = slots[Math.floor(Math.random() * slots.length)];
    const Mthree = slots[Math.floor(Math.random() * slots.length)];
    const Tone = slots[Math.floor(Math.random() * slots.length)];
    const Ttwo = slots[Math.floor(Math.random() * slots.length)];
    const Tthree = slots[Math.floor(Math.random() * slots.length)];
    const Bone = slots[Math.floor(Math.random() * slots.length)];
    const Btwo = slots[Math.floor(Math.random() * slots.length)];
    const Bthree = slots[Math.floor(Math.random() * slots.length)];
    var Snowflakes = bet;
    if (Mone === Mtwo || Mone === Mthree || Mthree === Mtwo) {
            const flakesPercent = Math.round(Snowflakes * 60 / 100) >= 1 ? Math.round(Snowflakes * 50 / 100) : 1;
            const coins = 100 + Snowflakes + flakesPercent;
            teamspeak.sendTextMessage(user, 1, `\n${Tone} | ${Ttwo} | ${Tthree}\n${Mone} | ${Mtwo} | ${Mthree}\n${Bone} | ${Btwo} | ${Bthree}`);
            teamspeak.sendTextMessage(user, 1, `You won ${coins} coins!`)
            teamspeak.sendTextMessage(user, 1, `You just won ❄ \`${flakesPercent}\`, you now have ❄ \`${bet}\`! Good job!`);
    } else {
           teamspeak.sendTextMessage(user, 1, `\n${Tone} | ${Ttwo} | ${Tthree}\n${Mone} | ${Mtwo} | ${Mthree}\n${Bone} | ${Btwo} | ${Bthree}`);
           teamspeak.sendTextMessage(user, 1, `You lost ❄ \`${Snowflakes}\`, you now have ❄ \`${bet}\`! Better luck next time!`);
    }
};

app.get("/api", (request, response) => {
});


const listener = app.listen(process.env.PORT, () => {
  log("ELITE-TS BOT API ONLINE NA PORTU: " + listener.address().port, 2);
});
