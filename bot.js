var sharp = require('sharp');
//console.dir(sharp.format);

var http = require('http');
var https = require('https');

var DiscordJS = require("discord.js");
var botJS = new DiscordJS.Client({autoReconnect: true, max_message_cache: 0});
//var Discordjs = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var request = require("request");
var Promise = require('promise');

var tinyRequest = require("tinyreq");

var cheerio = require("cheerio");


var fs = require('fs');
var ytdl = require('ytdl-core');

var lineReader = require('readline');           //for parsing lines later

var voiceChannelID = "348232512167739404";
var ytKey = fs.readFileSync("./ytKey.json");
var yt_api_key = JSON.parse(ytKey)['key']
var aliases_file_path = "aliases.json";
var voice_connection = null;
var voice_handler = null;
var recentEvents = "";
var story = 0;
var pcLogger = '';
var iniPlayers = [];
var hpPlayers = [];
var namePlayers = [];
var imagePlayers =[];
var currentTurn = 0;
var coordsPlayer = [];


var Jimp = require("jimp");



var Tile = function(x, y){
    this.x = x;
    this.y = y;
    this.width = 32;
}

var tiles = [];
var NUM_COLS = 37;
var NUM_ROWS = 20;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot

function streamToPromise(stream) {
    return new Promise(function(resolve, reject) {
        stream.on("end", resolve);
        stream.on("error", reject);
    });
}
//appends the adventure log to a textfile for book keeping purposes
function WriteDemo(recentEvents)
{
     fs.appendFileSync('adventureLog.txt', recentEvents);

    return new Promise(function(resolve, reject){ fs.readFile('adventureLog.txt','utf8', (err, data) => {
            if (err) throw err;
           console.log(data);

            resolve(data);

        });
    });


}
//Funtion used to retrieve data from website links, mainly utilized to retrieve stats of creature found on the pfsrd site
function scrape(url, data, cb) {
    // 1. Create the request
    tinyRequest(url, (err, body) => {
        if (err) { return cb(err); }

        // 2. Parse the HTML
        let $ = cheerio.load(body)
          , pageData = {}
          ;

        // 3. Extract the data
        Object.keys(data).forEach(k => {
           pageData[k]  = $('table').eq(0).find(data[k]).eq(0).text();//$(data[k]).eq(k).text();
                                //tr
        });

        // Send the data in the callback
        cb(null, pageData);
    });
}


//on start bot initialization for Discord.js api
botJS.on("ready", () => {

        var server_name = "Dungeons or Dragons"
        var text_channel_name = "general"
        var voice_channel_name = "Game"
        var aliases_path = "./alias.txt"
        var token = JSON.parse(fs.readFileSync("./auth.json"))['token']
        var aliases_file_path = aliases_path;


		var server = botJS.guilds.find("name", server_name);
		if(server === null) throw "Couldn't find server '" + server_name + "'";

		var voice_channel = server.channels.find(chn => chn.name === voice_channel_name && chn.type === "voice"); //The voice channel the bot will connect to
		if(voice_channel === null) throw "Couldn't find voice channel '" + voice_channel_name + "' in server '" + server_name + "'";

		text_channel = server.channels.find(chn => chn.name === text_channel_name && chn.type === "text"); //The text channel the bot will use to announce stuff
		if(text_channel === null) throw "Couldn't find text channel '#" + text_channel_name + "' in server '" + server_name + "'";

		voice_channel.join().then(connection => {voice_connection = connection;}).catch(console.error);

		fs.access(aliases_file_path, fs.F_OK, (err) => {
			if(err) {
				aliases = {};
			} else {
				try {
					aliases = JSON.parse(fs.readFileSync(aliases_file_path));
				} catch(err) {
					aliases = {};
				}
			}
		});

		botJS.user.setGame();
		console.log("Connected!");

});
//login the bot with the discord token
botJS.login(JSON.parse(fs.readFileSync("./auth.json"))['token']);


url = 'http://www.youtube.com/watch?v=90AiXO1pAiA';
//streamq = new ytdl(url);
musicIni = false;


//The meat of the project, the bot takes actions based on commands listed under case 'help'
botJS.on("message", message => {
    var message_text = message.content;

     if (message_text.substring(0, 1) == '!' && message.author.id !== botJS.user.id) {

     var args = message_text.substring(1).split(' ');
     var cmd = args[0];
     //takes off the !
     args = args.splice(1);
     var choice=message_text.split(" ")
     choice[0] = cmd;
     //switch based on command word
         switch(choice[0]) {
                     // !ping
                     case 'ping':
                         message.channel.send("Pong!");
                     break;

                     //sends a funny message involving the commandee slapping the arguement text
                     case 'slap':
                     if(choice[1]!=null)
                     {
                        var numChoices = 5;
                        var phrase = Math.floor(Math.random()*numChoices);

                        switch(phrase){

                        case 0:
                            message.channel.send(message.member.nickname + " slaps " + choice[1] + "!");
                        break;

                        case 1:
                            message.channel.send(message.member.nickname + " unleashes the slappening on " + choice[1] + "!");
                        break;

                        case 2:
                            message.channel.send(message.member.nickname + " backhands " + choice[1] + "!");
                        break;

                        case 3:
                            message.channel.send(message.member.nickname + " summons a slap elemental to assault " + choice[1] + "!");
                        break;

                        case 4:
                            message.channel.send(message.member.nickname + " slaps " + choice[1] + ", for mother Russia!");
                        break;

                        }
                     }
                     break;

                    //sends an emote involving someone flipping a table
                     case 'flip':
                        var numChoices = 5;
                        var phrase = Math.floor(Math.random()*numChoices);

                        switch(phrase){

                        case 0:
                            message.channel.send("(╯°□°)╯︵ ┻━┻");
                        break;

                        case 1:
                            message.channel.send("┬─┬﻿ ノ( ゜-゜ノ)");
                        break;

                        case 2:
                            message.channel.send("(╯°□°)╯︵ ┻━┻ ︵ ╯(°□° ╯)");
                        break;

                        case 3:
                            message.channel.send("┬─┬﻿ ︵ /(.□. \）");
                        break;

                        case 4:
                            message.channel.send("(╯°Д°）╯︵ /(.□ .)\ ");
                        break;

                        }
                     break;

                    //sends what s refered to as a 'lenny' face
                     case 'lenny':
                     message.channel.send("( ͡° ͜ʖ ͡°)");
                     break;

                    //displays all current commands and their parameters.  Those marked as [ADMIN] I set up to only function if my user id is the one who sent the message.
                     case 'help':
                     var commands = "!ping\n" + "!roll xdx+xdx+..\n"+"[ADMIN]!ambient [theme]\n"+"!currentAmbient\n"+"!search\n"+"!catchup\n"+"[ADMIN]!story #\n"
                     + "!initiative [join (hp) (init result), [ADMIN]add (name) (hp) (init result) (avatar url),  [ADMIN] remove (name), remove, [ADMIN]clear]\n" +"!nextTurn\n"
                     + "!bm\n" + "!move [[ADMIN] name] [(direction: l, r, u, d) (squares)]\n" + "!slap (name)\n" + "!flip\n" +"!lenny\n" + "!dmg (name) (amount)\n" + "!log [[ADMIN]set (name), (log)]\n"
                     + "[ADMIN]!finish\n";
                     message.channel.send(commands);
                     break;

                    //a dice rolling command, doesnt currently take flat modifiers, only dice
                     case 'roll':
                                     choice=choice[1].split("+")
                                     k = 0;
                                     var rolls = "";
                                     var total = 0;
                                     while (choice[k] != null) {

                                         var numDice = parseInt(choice[k], 10);
                                         if(typeof numDice === "number")
                                         {

                                                choice[k] = choice[k].substring(numDice.toString().length);

                                                if(typeof choice[k][0] !== "undefined" && choice[k][0] == 'd')
                                                {
                                                     choice[k] = choice[k].substring(1);
                                                     diceSize = parseInt(choice[k], 10);
                                                     if(typeof diceSize === "number")
                                                     {
                                                         //var rolls = "";
                                                         //var total = 0;
                                                         for( i = 0; i < numDice; ++i)
                                                         {
                                                             var roll = Math.floor((Math.random() * diceSize) + 1);
                                                             total += roll;
                                                             rolls = rolls.concat(roll.toString());
                                                             rolls = rolls.concat("+");
                                                         }
                                                         if(choice[k+1] == null)
                                                         {
                                                             rolls = rolls.concat(" =\n");
                                                             rolls = rolls.concat(total.toString());

                                                             if(total == numDice * diceSize)
                                                             {
                                                                 message.channel.send('BY THE GODS!!! MAX DAMAGE!');
                                                             } else if(total == numDice)
                                                             {
                                                                 message.channel.send('A most unexceptional roll... min damage...');
                                                             }else if(total > (numDice*diceSize)/2)
                                                             {
                                                                 message.channel.send('A respectable hit, sir!');

                                                             }else if(total < (numDice*diceSize)/2)
                                                             {
                                                                message.channel.send('Your form is lacking, good sir!');
                                                             }else if(total == (numDice*diceSize)/2)
                                                             {
                                                                 message.channel.send('I have no strong feels about this roll, it is *very* average');

                                                             }

                                                            message.channel.send(rolls);

                                                         }
                                                     }
                                                }
                                         }
                                         k+=1;
                                     }
                                     message.channel.send('Roll!');

                                 break;

                     //originally was to be used to deliver story elements but it proved cumbersome to setup for each event
                     case 'story':
                                             if(message.author.id == 222511615780716547)
                                             {
                                                 switch(story){

                                                 case 0:
                                                 ++story;
                                                     message.channel.send('Cell 1\n\nThe floor is covered in dry hay, and the occupants are shackled to the wall. \nTheir cell door is open.');
                                                     message.channel.send('Cell 2'
                                                                           +'In a haze, a man resembling the legendary Corydon Orbweaver appears, squatting over what seems to be a deck of cards.  He reveals 2 cards: The Joker (with trademark), The Ace of Spades, he then vanishes.'
                                                                           +'\nThere is a skeleton in hide armor sitting against the wall. The floor of this cell has large patches of grass growing in between the bricks of the floors.');
                                                     message.channel.send('Cell 3\nThere\'s a glowing ash pile in the corner with a scroll tacked to the wall. The floor is plain brick.');
                                                     recentEvents = recentEvents.concat('\nYou found yourselves in a locked prison cell, visited by a most peculiar man, Corydon Orbweaver.');
                                                 break;

                                                 case 1:
                                                 ++story;
                                                    //message.channel.send('```cs\nAfter the fantastic battle you began to #hear a faint moaning from the corpse\n```');
                                                    message.channel.send('The doors are locked.\n\nOn the pedestal is a bust of a rather plump man who seemed to suffer from male pattern baldness. \n\nThere are rubies where his eyes would be and he is sporting a rather smug grin.'
                                                                        +'//in a rather new york aaaeehh accent//```csLook oo da cat dragged in! Wadda ya in fah? I\'m in fah moider, on account of mah looks be\'in killa. Oh! ```\n//he shoots a laser from his eye, killing a fly//');
                                                    recentEvents = recentEvents.concat('\nYou met an animate bust,\n')
                                                 break;

                                                 case 2:
                                                    message.channel.send('``` See\'in as you\'ll be stayen ere a while on a account of yer civil disobedience you might as well know more about yer residence```');
                                                    message.channel.send('/a paper prints out of the base of the bust/');
                                                    message.channel.send('it reads:'
                                                                         + '\nZartacla, this place, is run by the Black Mage Guild. '
                                                                         + '\n-Contracted by the government of Arlast to run its infamous flying kingdom of a prison '
                                                                         + '\n-Specialize in the schools of Abjuration and Divination '
                                                                         + '\n-Many of the guild members originate from mercenary organizations such as the Wailing Bard Mouth, or security firms like R I P (Rogue Interception and other Pleasantries)  '
                                                                         + '\n ');
                                                    message.channel.send('```dare leader--your warden, is nun udder dan...```');
                                                    message.channel.send('Baxter Branch:'
                                                                        + '\n impervious one man think-tank. Architect of Zartacla'
                                                                        + '\n Resides in his office at the top of this serfdom, his only regular company seen leaving alive are his birds of prey.')
                                                    recentEvents = recentEvents.concat('\nwho informed you that you are currently being held in Zatacla, run by the Black Mage Guild, and wardened by the apparently famed Baxter Branch\n')
                                                 break;

                                                 case 3:
                                                    message.channel.send('```Yar now gonna be assigned roles soes you can work off yer debt to society...```');
                                                    message.channel.send('/you hear whirling and wizzing, folloed by a ping pong ball shooting out of a pipe/\n/it lands in a funnel protruding from the bust\'s head/');
                                                    message.channel.send('```Farmer! Oh hey dats a rare one...```');
                                                    message.channel.send('```Farmer! Do\'es Sky carrots really need waterin...```');
                                                    message.channel.send('/this continues till the last pc is up/');;
                                                    message.channel.send('```aaaaaand... oh, hmm, this can\'t be right. Maybe I should toss it.\nSheriff\'s Deputy.```');
                                                    recentEvents = recentEvents.concat('\nYou had all been assigned farmer, except for one.  Who was lucky enough to be assigned Deputy\n');
                                                 break;
                                                 case 5:
                                                 //++story;
                                                    //message.channel.send(WriteDemo());
                                                    Promise.all([WriteDemo()]).then((temp)=>{
                                                        message.channel.send(temp);
                                                    });
                                                 break;
                                                 }
                                             }
                                 break;

                                //command that allows either the [ADMIN] or assigned log keeper append items to the adventure log
                                 case 'log':
                                 if(choice[1] == 'set' && message.author.id == 222511615780716547)
                                 {
                                    pcLogger = choice[2];
                                    message.channel.send("Official book keeper set!");
                                 }
                                 else if(message.member.nickname == pcLogger)
                                 {
                                    if(choice[1]!=null)
                                    {
                                        recentEvents = recentEvents.concat('\n'+choice[1]+'\n');
                                        message.channel.send('Log recorded!');
                                    }
                                 }
                                 break;

                                //saves adventure log to a txt file
                                 case 'finish':
                                 if(message.author.id == 222511615780716547)
                                 {

                                     Promise.all([WriteDemo()]).then((temp)=>{
                                      //message.channel.send(temp);
                                        message.channel.send('Log saved to file, sir!');
                                     });
                                 }
                                 break;

                                //This command utilizes sharp for creating and editing a battlemat.  Users are represented by their profile picture as tokens, creatures use links to images on the web
                                 case 'bm':
                                //set the battlmat to blank
                                 sharp("grid-size-corrected.png").flatten().background({r: 255, g: 255, b: 255, alpha: 1}).toFile("grid-size-corrected1.png", function(err, info) {
                                                               if(err) throw err;         });
                                  var resizeTransform = sharp()
                                     .flatten()
                                     .resize(32, 32)
                                     .background({r: 255, g: 255, b: 255, alpha: 1});

                                var responses = [];
                                var completed_requests = 0;
                                var promises = [];

                                //for all items currently in the combat, place their token on the mat
                                for (i in imagePlayers) {
                                    console.log("i: "+i);
                                    //retrieve image from https source NOTE: I need to implement a switch for possible http links
                                    https.get(imagePlayers[i], function(res) {
                                        responses[completed_requests] = (res);
                                        completed_requests++;

                                        console.log("Current token(PRE): " + (completed_requests-1));
                                        var writeStream = fs.createWriteStream(completed_requests-1+"avatar.png");
                                        //download the token and resize it
                                        promises.push(new Promise((resolve, reject) => {

                                        // Do your resizing, manipulation, etc
                                           res.pipe(sharp()
                                          .flatten()
                                          .resize(32, 32)
                                          .background({r: 255, g: 255, b: 255, alpha: 1})
                                          .toFile(completed_requests-1+"avatar.png", function(err, data) {  // Assuming this toFile is an async operation and uses a callback

                                            // After all the resizing, manipulation and file saving async functions are complete, resolve the Promise
                                            resolve()
                                          }));


                                      }))
                                        //If all tokens are downloading
                                        if (completed_requests == imagePlayers.length) {

                                            //wait till all tokens are processed and downloaded then...
                                            Promise.all(promises).then(function(images){
                                            var boardPromises = [];
                                            var avatarNames = [];

                                            for(k in images)
                                            {
                                                avatarNames[k] = k+"avatar.png";
                                                console.log(avatarNames[k]);
                                            }
                                            console.log(avatarNames);

                                            const options = {
                                              raw: {
                                                width: 1184,
                                                height: 640,
                                                channels: 3
                                              }
                                            };

                                            var layTokens = sharp("grid-size-corrected1.png", options)
                                                             .flatten()
                                                             .withMetadata()
                                                             .background({r: 255, g: 255, b: 255, alpha: 1})
                                                             .raw()
                                                             .toBuffer();


                                            var j = avatarNames.length-1;

                                            //place the images on the board
                                            var tokenize = avatarNames.reduce(function(input, overlay){

                                                var x = coordsPlayer[j][0];
                                                var y = coordsPlayer[j][1];
                                                console.log("X: "+x+" Y: "+y);
                                                console.log("^coords^")
                                                --j;

                                                return input.then(function(data){

                                                    return sharp(new Buffer(data), options).png().overlayWith(overlay, {top: y*32, left:x*32}).raw().toBuffer();
                                                });
                                            }, layTokens);

                                            sharp.cache();

                                            boardPromises.push(tokenize.then(function(data){

                                                return sharp(new Buffer(data), options).png().toFile("grid-size-corrected2.png");
                                            }));

                                                 //wait till all tokens are on the board, then send the board as a message
                                                 Promise.all(boardPromises).then(function(images){
                                                    message.channel.send("",{
                                                    file: "grid-size-corrected2.png"
                                                    });
                                                 })

                                            })



                                        }
                                    });
                                }



                                 break;

                                //sends a pm to the commandee to catch them up on recent events in the session
                                 case 'catchup':
                                              //var target = //bot.getUser("username", username);
                                              var response = "While you were out, we... ";
                                              response = response.concat(recentEvents);
                                              message.author.send(response);

                                 break;

                                 //plays the audio of youtube videos over the voicechat, used to create ambiance
                                 case 'ambient'://NOTE: you yourself must be part of the voice channel to hear the bot
                                     if(message.author.id == 222511615780716547)
                                     {
                                        //url = 'https://www.youtube.com/watch?v=NgNQzWiQzqc';

                                        //note to self, array of links for a playlist.
                                        switch(choice[1]){

                                            case 'horror':
                                            url = 'https://www.youtube.com/watch?v=AlDivIaiuMU';
                                            break;

                                            case 'battle':
                                            url = 'https://www.youtube.com/watch?v=-eZAaXYpD40';
                                            break;

                                            case 'town':
                                            url = 'https://www.youtube.com/watch?v=xu2pESvXcmM';
                                            break;

                                            case 'stop':
                                            url ='https://www.youtube.com/watch?v=jhFDyDgMVUI';
                                            break;

                                            case 'jep':
                                            url = 'https://www.youtube.com/watch?v=IkdmOVejUlI';
                                            break;

                                            }
                                            //message.channel.send("Currently playing: " + url);
                                                        if(voice_handler !== null) {
                                                                            voice_handler.end();
                                                        }

                                                        var audio_stream = ytdl(url, {filter: 'audioonly', quality: 'lowest'});//need to test: , {filter: 'audio', quality: 'lowest'}

                                                        var voiceChannel = message.member.voiceChannel;
                                                        voice_handler = botJS.voiceConnections.array()[0].playArbitraryInput(audio_stream);//playStream(audio_stream);
                                                        voice_handler.on('error', console.error);
                                                        voice_handler.setVolume(1);
                                                        //voice_connection.playFile("C:/Users/Michael Walsh/discordBot/myFile1.mp3")
                                                        voice_handler.once("end", reason => {
                                                                voice_handler = null;
                                                                botJS.user.setGame();
                                                                console.log("Finished!");
                                                                //if(!stopped && !is_queue_empty()) {
                                                                //  play_next_song();
                                                                //}
                                                        });
                                     }
                                 break;

                                //displays currently playing song
                                 case 'currentAmbient':
                                 if (voice_handler !== null)
                                 message.channel.send("Currently playing: " + url);
                                 else
                                 message.channel.send("Currently playing: " + "nothing...");
                                 break;

                                 //sends a google link with the arguments received to the chat
                                 case 'search':
                                 var i = 1;
                                 var search ="";
                                 while (choice[i] != null) {
                                 search = search.concat(choice[i]);
                                 if(choice[i+1]!=null)
                                 {
                                    search = search.concat("+");
                                 }
                                 ++i;
                                 }
                                 message.channel.send("https://www.google.com/search?q=" + search)
                                 break;

                                //scrapes stats from monster pages on the pfsrd and stores them in json format
                                case 'scrape':
                                if(choice[1] == null)
                                {
                                    choice[1] = 'http://www.d20pfsrd.com/bestiary/monster-listings/magical-beasts/spawn-of-destruction/tarrasque/';
                                    //break;
                                }
                                //http://www.d20pfsrd.com/bestiary/monster-listings/magical-beasts/spawn-of-destruction/tarrasque/
                                tinyRequest(choice[1], (err, body) => {
                                        if (err) { throw cb(err); }

                                        // 2. Parse the HTML
                                        let $ = cheerio.load(body)
                                          , pageData = {}
                                          ;

                                        // 3. Extract the data
                                        //Object.keys(data).forEach(k => {
                                           pageData["Name"]  = $('table').eq(0).find('th').eq(0).text();//$(data[k]).eq(k).text();
                                           pageData["CR"]  = $('table').eq(0).find('th').eq(1).text();
                                           pageData["Ini"]  = $('table').eq(0).find('p').eq(0).text();
                                           pageData["Ini"] = parseInt(pageData["Ini"].substring(pageData["Ini"].indexOf('Init')).slice(4, 7).replace(' ', ''));
                                           pageData["AC"]  = parseInt($('table').eq(0).find('p').eq(2).text().slice(3, 6).replace(' ', ''));
                                           console.log($('table').eq(0).find('p').eq(2).text().slice(2, 6).replace(' ', ''));
                                           pageData["Touch AC"]  = $('table').eq(0).find('p').eq(2).text();
                                           pageData["Touch AC"] = parseInt(pageData["Touch AC"].substring(pageData["Touch AC"].indexOf('touch')).slice(5, 9).replace(' ', ''));
                                           pageData["Flat-footed AC"]  = $('table').eq(0).find('p').eq(2).text();
                                           pageData["Flat-footed AC"] = parseInt(pageData["Flat-footed AC"].substring(pageData["Flat-footed AC"].indexOf('flat-footed')).slice(11, 16).replace(' ', ''));

                                           //pageData["Temp"]  = $('table').eq(0).find('p').eq(2).text();
                                        //});
                                        //});

                                        // Send the data in the callback
                                        //cb(null, pageData);
                                        console.log(pageData);
                                    });

                                break;

                                //use to inflict or heal damage to an item in the initiative
                                 case 'dmg':
                                 //maybe initialize monster ac and stuff, then debuffs
                                 if(choice[1]!= null)
                                 {
                                    for(i in namePlayers)
                                    {
                                        if(namePlayers[i] == choice[1])
                                        {
                                            break;
                                        }
                                    }
                                    if(namePlayers[i] != choice[1])
                                    {
                                        message.channel.send("I know not of this "+choice[1]+" you speak of, did you mean someone else?");
                                        break;
                                    }
                                    if(typeof parseInt(choice[2]) === 'number')
                                    {
                                        hpPlayers[i]-= parseInt(choice[2]);
                                    }
                                    else
                                    {
                                        message.channel.send("I'm afraid I've never encountered a number shaped quite like that.");
                                    }

                                 }
                                 break;

                                //changes the turn in the combat
                                 case 'nextTurn':
                                 if(message.author.id == 222511615780716547 || (namePlayers[currentTurn]!=null && namePlayers[currentTurn] == message.member.nickname)){
                                 currentTurn+=1;
                                 if(currentTurn >= namePlayers.length)
                                 currentTurn = 0;

                                 message.channel.send("It is now "+namePlayers[currentTurn] +"'s turn.");
                                 }
                                 else
                                 {
                                    message.reply("It is not your turn sir.");
                                 }
                                 break;

                                 //moves a piece along the battlemat sent from the !bm command
                                 case 'move':
                                 for(var k=0;k<namePlayers.length;++k)
                                 {
                                    if(namePlayers[k] == message.member.nickname)
                                    {
                                        //message.reply("Sir, you are already in the order!");
                                        break;
                                    }
                                 }
                                 if(namePlayers[k] != message.member.nickname && message.author.id != 222511615780716547)
                                 {
                                    message.reply("Sir, you not in the order!");
                                    break;
                                 }
                                 if(message.author.id == 222511615780716547  && typeof parseInt(choice[3], 10) === "number")
                                 {
                                    for(var k=0;k<namePlayers.length;++k)
                                    {
                                        if(namePlayers[k] == choice[1])
                                        {
                                            //message.reply("Sir, you are already in the order!");
                                            break;
                                        }
                                    }
                                    if(namePlayers[k] != choice[1])
                                    {
                                        message.reply("Sir, I could not find them in the order!");
                                        break;
                                    }
                                    switch(choice[2])
                                     {
                                        case 'l':
                                        if(typeof parseInt(choice[3], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[3], 10));
                                            if(coordsPlayer[k][0]-moveSpeed >=0)
                                            {
                                                coordsPlayer[k][0]-=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'r':
                                        if(typeof parseInt(choice[3], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[3], 10));
                                            if(coordsPlayer[k][0]+moveSpeed <=NUM_COLS)
                                            {
                                                coordsPlayer[k][0]+=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'u':
                                        if(typeof parseInt(choice[3], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[3], 10));
                                            if(coordsPlayer[k][1]-moveSpeed >=0)
                                            {
                                                coordsPlayer[k][1]-=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'd':
                                        if(typeof parseInt(choice[3], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[3], 10));
                                            if(coordsPlayer[k][1]+moveSpeed <=NUM_ROWS)
                                            {
                                                coordsPlayer[k][1]+=moveSpeed;
                                            }

                                        }
                                        break;
                                     }
                                 }
                                 else
                                 {
                                     switch(choice[1])
                                     {
                                        case 'l':
                                        if(typeof parseInt(choice[2], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[2], 10));
                                            if(coordsPlayer[k][0]-moveSpeed >=0)
                                            {
                                                coordsPlayer[k][0]-=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'r':
                                        if(typeof parseInt(choice[2], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[2], 10));
                                            if(coordsPlayer[k][0]+moveSpeed <=NUM_COLS)
                                            {
                                                coordsPlayer[k][0]+=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'u':
                                        if(typeof parseInt(choice[2], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[2], 10));
                                            if(coordsPlayer[k][1]-moveSpeed >=0)
                                            {
                                                coordsPlayer[k][1]-=moveSpeed;
                                            }

                                        }
                                        break;

                                        case 'd':
                                        if(typeof parseInt(choice[2], 10) === "number")
                                        {
                                            var moveSpeed = Math.abs(parseInt(choice[2], 10));
                                            if(coordsPlayer[k][1]+moveSpeed <=NUM_ROWS)
                                            {
                                                coordsPlayer[k][1]+=moveSpeed;
                                            }

                                        }
                                        break;
                                     }
                                 }
                                 break;

                                //Adds players or creatures to the initiative order
                                 case 'initiative':

                                    switch(choice[1]){

                                        case 'join'://a nickname must be set for this to work
                                            //message.reply(", joining...");
                                            if(choice[2]!=null && typeof parseInt(choice[2], 10) === "number" && choice[3]!=null && typeof parseInt(choice[3], 10) === "number")
                                            {
                                                //check if they are already on the list... TODO
                                                for(var k=0;k<namePlayers.length;++k)
                                                {
                                                    if(namePlayers[k] == message.member.nickname)
                                                    {
                                                        message.reply("Sir, you are already in the order!");
                                                        break;
                                                    }
                                                }
                                                if(namePlayers[k] == message.member.nickname)
                                                {
                                                    break;
                                                }
                                                var i = 0;
                                                //message.reply(", finding spot...");
                                                while(i<namePlayers.length && iniPlayers[i] > choice[3])
                                                {
                                                    ++i;
                                                }

                                                // move everything down then insert
                                                for(j=namePlayers.length-1; j>=i;--j)
                                                {
                                                    namePlayers[j+1] = namePlayers[j];
                                                    hpPlayers[j+1] = hpPlayers[j];
                                                    iniPlayers[j+1] = iniPlayers[j];
                                                    imagePlayers[j+1]=imagePlayers[j];
                                                    coordsPlayer[j+1] = coordsPlayer[j];
                                                }

                                                namePlayers[i] = message.member.nickname;
                                                hpPlayers[i] = parseInt(choice[2], 10);
                                                iniPlayers[i] = parseInt(choice[3], 10);
                                                imagePlayers[i] = message.author.avatarURL;
                                                coordsPlayer[i] = [0,0];
                                                //message.reply(", joined...");
                                            }
                                        break;


                                        case 'add':
                                        if(message.author.id == 222511615780716547){
                                            if(choice[2] != null && choice[3]!=null && typeof parseInt(choice[3], 10) === "number" && choice[4]!=null && typeof parseInt(choice[4], 10) === "number" && choice[5]!=null)
                                            {
                                                var i = 0;
                                                while(i<namePlayers.length && iniPlayers[i] > choice[4])
                                                {
                                                    ++i;
                                                }

                                                // move everything down then insert
                                                for(j=namePlayers.length-1; j>=i;--j)
                                                {
                                                    namePlayers[j+1] = namePlayers[j];
                                                    hpPlayers[j+1] = hpPlayers[j];
                                                    iniPlayers[j+1] = iniPlayers[j];
                                                    imagePlayers[j+1]=imagePlayers[j];
                                                    coordsPlayer[j+1] = coordsPlayer[j];
                                                }

                                                namePlayers[i] = choice[2];//message.member.nickname;
                                                hpPlayers[i] = parseInt(choice[3], 10);
                                                iniPlayers[i] = parseInt(choice[4], 10);
                                                imagePlayers[i] = choice[5];
                                                coordsPlayer[i] = [Math.floor((Math.random() * 37)),Math.floor((Math.random() * 20))];
                                                console.log(coordsPlayer[i][0] + " " + coordsPlayer[i][1]);
                                                console.log("\n" + imagePlayers[i]);
                                            }
                                        }
                                        break;

                                        //completely clears initiative
                                        case 'clear':
                                        if(message.author.id == 222511615780716547){
                                            namePlayers = [];
                                            hpPlayers = [];
                                            iniPlayers = [];
                                            imagePlayers = [];
                                            coordsPlayer = [];
                                            message.channel.send("Initiative is nice and clean, sir!");
                                            }
                                        break;

                                        //removes item from initiative
                                        case 'remove':
                                        if(message.author.id == 222511615780716547){
                                            if(choice[2]!= null)
                                            {
                                                for(i=0;i<namePlayers.length;++i)
                                                {
                                                    if(namePlayers[i] == choice[2])
                                                    {
                                                        namePlayers[i] = "<Removed>";
                                                        message.channel.send("The scoundrel was removed, sir.")
                                                        break;
                                                    }
                                                }
                                                if(i == namePlayers.length)
                                                {
                                                    message.channel.send("I could not find " +choice[2]+", sir.")
                                                }
                                            }
                                        }
                                        else
                                        {
                                            for(i=0;i<namePlayers.length;++i)
                                            {
                                                 if(namePlayers[i] == message.member.nickname)
                                                 {
                                                         namePlayers[i] = "<Removed>";
                                                         message.reply("You were removed, sir.")
                                                         break;
                                                 }
                                            }
                                            if(i == namePlayers.length)
                                            {
                                                message.reply("I could not find you in the list, sir.");
                                            }
                                        }
                                        break;

                                        default:
                                        for(i=0;i<namePlayers.length;++i)
                                        {
                                            var ini = "[" + namePlayers[i] + "]" + " HP: " + hpPlayers[i] + " Ini:" + iniPlayers[i];
                                            //message.channel.send("[" + namePlayers[i] + "]" + " HP: " + hpPlayers[i] + " Ini:" + iniPlayers[i]);
                                            if(i == currentTurn)
                                            {
                                                ini = ini.concat("<=");
                                            }
                                            message.channel.send(ini);
                                        }
                                        break;
                                        }

                                 break;

         }

     }



});
