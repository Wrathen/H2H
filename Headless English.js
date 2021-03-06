﻿// Room Settings
var _roomName = "Room Name";
var _botName = "Bot Name";
var _roomPublic = true;
var _roomMaxPlayers = 8;
// Bot/Ingame Settings
var _quiteMode = false; // Doesn't send unneccessary messages when its true...
var _gamePaused = false;
// Bad Admin
var _badAdmins = []; // Array to hold bad admins
var _badAdminVoteCount = 0; // Current Vote Count For The Current Admin
var _badAdminVoteThreshold = 5; // If Count == Threshold then We Make The Current Admin a Bad Admin.
var _playersVoted = []; // Array to hold who voted in the last _voteDelay milliseconds...
var _voteDelay = 1000 * 60;
// Automatic Ban Removal
var _removeBans; // This will be used for setInterval()
var _removeBansInterval = 1000 * 300;
// Bad Admin Detector - Checks Last Room Leavings (Leave + ing = Leaving)
var _lastRoomLeavings; // Checking for possible bans since basro doesn't give us the information about bans/kicks/leaves... We have to assume it... Also will be used for setInterval();
var _lastRoomLeavingsCount = 0; // How Many Players Left The Room In the Last _lastRoomLeavingsInterval milliseconds
var _lastRoomLeavingsInterval = 1000 * 10;
var _lastRoomLeavingsThreshold = 3; // If Count == Threshold then We Make The Current Admin a Bad Admin. --- We assume the admin banned some people. 
// Strings
var _stringQuiteModeOn = "Bot Will No Longer Speak!..";
var _stringQuiteModeOff = "Bot Will Speak!..";
var _stringBanRemoval = "All Bans Are Removed!";
var _stringVoteOnDelay = "You can only vote every " + _voteDelay/1000 + " seconds!";
var _stringVoteNoAdminFound = "There is no Admin in the room! Type !admin to become one!";
var _stringVoteStatus = "Current Vote Status: ";
var _stringVoteSuccess = " Is Selected as a Bad Admin! To Become The New Admin type !admin";
var _stringMakeAdminSuccess = " Is Now An Admin!";
var _stringMakeAdminErrorBadAdmin = "Sorry But You're a Bad Admin!";
var _stringMakeAdminErrorAdminExists = "Sorry But There Is Already an Admin in the Room...";
var _stringChangeAdminSuccess = "Admin was changed!";
var _stringRemoveBadAdmin = " Is not a Bad Admin Anymore...";
var _stringOnBanRemoval = "All Bans Removed! Next Ban Removal Will Be In " + _removeBansInterval/1000 + " Seconds!";
var _stringOnPlayerJoinRoomConsoleOutput = " has joined!"; // For Console Output
var _stringOnPlayerJoinRoomWelcomeMessage = "Welcome "; // + player.name + !
var _stringOnPlayerJoinNoAdminFound = "There is no Admin in the Room. Type !admin to Become one!";
var _stringOnLastRoomLeavingsTrigger = "BAD ADMIN!!!";
var _stringOnPlayerLeaveRoomConsoleOutput = " has left!"; // For Console Output
var _stringOnPlayerLeaveAdminLeave = "Admin Has Left! Type !admin To Become The New Admin!";
var _stringOnTeamVictoryRedWin = "Congratulations Red Team!";
var _stringOnTeamVictoryBlueWin = "Congratulations Blue Team!";
var _stringOnChatCommandCommands = "!commands"; // Admin and Player Command
var _stringOnChatCommandPause = "!p"; // Admin Command
var _stringOnChatCommandQuiteBot = "!quite"; // Admin Command
var _stringOnChatCommandAdmin = "!admin"; // Admin and Player Command
var _stringOnChatCommandStartGame = "!start"; // Admin Command
var _stringOnChatCommandStopGame = "!stop"; // Admin Command
var _stringOnChatCommandGameMode3v3 = "!v3"; // Admin Command
var _stringOnChatCommandGameMode1v1 = "!v1"; // Admin Command
var _stringOnChatCommandRematch = "!rematch"; // Admin Command
var _stringOnChatCommandRemoveBans = "!removebans"; // Admin Command
var _stringOnChatCommandRemoveBansResponse = "All Bans Are Removed!"; // Admin Command Response
var _stringOnChatCommandContact = "!contact"; // Player Command
var _stringOnChatCommandContactResponse = "Contact Information Here"; // Player Command Response
var _stringOnChatCommandHello = "!hello"; // Player Command
var _stringOnChatCommandHelloResponsePreString = "Hello "; // PreString + Name + AfterString = Response
var _stringOnChatCommandHelloResponseAfterString = "!"; // In This Case a player named Wrath would get a response of "Hello Wrath!";
var _stringOnChatCommandAdvertise = "!ad"; // Player Command
var _stringOnChatCommandAdvertiseResponse = "Advertisement Message Here!"; // Player Command Response
var _stringOnChatCommandVoteBadAdmin = "!badadmin"; // Player Command
var _stringOnChatCommandCommandsAdminResponse = "Commands You Can Use: !p, !quite, !admin, !start, !stop, !v3, !v1, !rematch, !removebans";
var _stringOnChatCommandCommandsPlayerResponse = "Commands You Can Use: !hello, !contact, !admin, !ad, !badadmin";
// Room Initialization
var room = HBInit({ roomName: _roomName, playerName: _botName, public:_roomPublic, maxPlayers: _roomMaxPlayers });

// Game Functions
function GameMode1v1(){room.stopGame();setTimeout(function() {room.setDefaultStadium("Classic");room.setScoreLimit(2);room.setTimeLimit(2);room.startGame();}, 200);};
function GameMode3v3(){room.stopGame();setTimeout(function() {room.setDefaultStadium("Big");room.setScoreLimit(3);room.setTimeLimit(3);room.startGame();}, 200);};

// Bot Functions
function SendMsg(msg, ignoreQuiteMode=true){if(!ignoreQuiteMode && _quiteMode){return;}room.sendChat(msg);};
function QuiteBot(){if(!_quiteMode){SendMsg(_stringQuiteModeOn,true);}else{SendMsg(_stringQuiteModeOff,true)}_quiteMode=!_quiteMode;}

// Player Functions
function Kick(name, msg){room.kickPlayer(GetPlayerByName(name).id,msg,false);}
function Ban(name, msg){room.kickPlayer(GetPlayerByName(name).id,msg,true);}
function MakeAdmin(player){if(GetAdmin()==null&&!IsBadAdmin(player.name)){room.setPlayerAdmin(player.id, true);SendMsg(player.name + _stringMakeAdminSuccess,true);_badAdminVoteCount=0;}else if(IsBadAdmin(player.name)){SendMsg(_stringMakeAdminErrorBadAdmin,false);}else{SendMsg(_stringMakeAdminErrorAdminExists,false);}}

// Utility Functions
function GetAllPlayers(){return room.getPlayerList().filter((player) => player.id != 0 );};
function GetPlayerByName(name){return room.getPlayerList().filter((player) => player.name == name)[0];};
function GetAllPlayersByName(name){return room.getPlayerList().filter((player) => player.name == name);};
function GetAdmin(){return room.getPlayerList().filter((player) => player.admin == true && player.id != 0)[0];};
function GetAllAdmins(){return room.getPlayerList().filter((player) => player.admin == true && player.id != 0);};

// Bad-Admin-System Functions
function IsBadAdmin(name){for(var i=0;i<_badAdmins.length;i++){if(_badAdmins[i].name == name){return true;}}return false;}
function DidVote(name){for(var i=0;i<_playersVoted.length;i++){if(_playersVoted[i].name == name){return true;}}return false;}
function VoteBadAdmin(player){if(DidVote(player.name)){SendMsg(_stringVoteOnDelay,false);return;}var currentAdmin=GetAdmin();if(currentAdmin==null){SendMsg(_stringVoteNoAdminFound,true);return;}if(++_badAdminVoteCount>_badAdminVoteThreshold-1){MakeBadAdmin();}else{SendMsg(_stringVoteStatus+_badAdminVoteCount+"/"+_badAdminVoteThreshold+"  ["+currentAdmin.name+"]",true);}_playersVoted[_playersVoted.length]=player;setTimeout(function(){if(--_badAdminVoteCount<0){_badAdminVoteCount++;};for(var i=0;i<_playersVoted.length;i++){if(_playersVoted[i].name == player.name){_playersVoted.splice(i,1);}}}, _voteDelay);}
function MakeBadAdmin(){var currentAdmin = GetAdmin();_badAdmins[_badAdmins.length]=currentAdmin;room.setPlayerAdmin(currentAdmin.id, false);SendMsg(currentAdmin.name + _stringVoteSuccess,true);};

// Ban-Removal-System Functions
function RemoveBans(){SendMsg(_stringBanRemoval,false);room.clearBans();}

// Console Functions -- Usable Through Console...
function ChangeAdmin(name, makeOldAdminABadAdmin = false, removeAllAdmins = true){if(makeOldAdminABadAdmin){MakeBadAdmin();}if(removeAllAdmins){var admins=GetAllAdmins();for(var i=0;i<admins.length;i++){room.setPlayerAdmin(admins[i].id,false);}}else{room.setPlayerAdmin(GetAdmin().id,false);}room.setPlayerAdmin(GetPlayerByName(name)[0].id,true);SendMsg(_stringChangeAdminSuccess,true);}
function KickAll(msg = "Kicking All.", ban = false){var players=GetAllPlayers();for(var i=0;i<players.length;i++){room.kickPlayer(players[i].id,msg,ban);}}
function RemoveBadAdmin(name){for(var i=0;i<_badAdmins.length;i++){if(_badAdmins[i].name == name){_badAdmins.splice(i,1);SendMsg(name + _stringRemoveBadAdmin,true);return;}}}

// Events
room.onPlayerJoin = function(player) {console.log(player.name + _stringOnPlayerJoinRoomConsoleOutput);SendMsg(_stringOnPlayerJoinRoomWelcomeMessage + player.name + "!",false); if(GetAdmin()==null){SendMsg(_stringOnPlayerJoinNoAdminFound,true);}}
room.onPlayerLeave = function(player) {if(++_lastRoomLeavingsCount>_lastRoomLeavingsThreshold-1 && GetAdmin() != null){_lastRoomLeavingsCount=0;SendMsg(_stringOnLastRoomLeavingsTrigger);RemoveBans();MakeBadAdmin();}console.log(player.name + _stringOnPlayerLeaveRoomConsoleOutput);if(player.admin){SendMsg(_stringOnPlayerLeaveAdminLeave);}}
room.onTeamVictory = function(scores) {if(scores.red>scores.blue){SendMsg(_stringOnTeamVictoryRedWin,false);}else{SendMsg(_stringOnTeamVictoryBlueWin,false);}}
room.onPlayerChat = function(player, message) {console.log(player.name + ": " + message); if(player.admin){if(message == _stringOnChatCommandPause){room.pauseGame(!_gamePaused); _gamePaused = !_gamePaused;}else if(message==_stringOnChatCommandQuiteBot){QuiteBot();}else if(message == _stringOnChatCommandAdmin){room.setPlayerAdmin(player.id, !player.admin);}else if(message == _stringOnChatCommandStartGame){room.startGame();}else if(message==_stringOnChatCommandStopGame){room.stopGame();}else if(message==_stringOnChatCommandGameMode3v3){GameMode3v3();}else if(message==_stringOnChatCommandRematch){room.stopGame();room.startGame();}else if(message==_stringOnChatCommandGameMode1v1){GameMode1v1();}else if(message==_stringOnChatCommandRemoveBans){SendMsg(_stringOnChatCommandRemoveBansResponse,true);room.clearBans();}else if(message==_stringOnChatCommandCommands){SendMsg("[" + player.name + " - Admin] " + _stringOnChatCommandCommandsAdminResponse ,true);}} else {if(message==_stringOnChatCommandCommands){SendMsg("[" + player.name + " - Player] " + _stringOnChatCommandCommandsPlayerResponse,false);}else if(message==_stringOnChatCommandContact){SendMsg(_stringOnChatCommandContactResponse,false);}else if(message==_stringOnChatCommandHello){SendMsg(_stringOnChatCommandHelloResponsePreString + player.name + _stringOnChatCommandHelloResponseAfterString,false);}else if(message==_stringOnChatCommandAdvertise){SendMsg(_stringOnChatCommandAdvertiseResponse,false);}else if(message==_stringOnChatCommandVoteBadAdmin){VoteBadAdmin(player);}else if(message==_stringOnChatCommandAdmin){MakeAdmin(player);}}};

// Intervals
_removeBans = setInterval(function() {SendMsg(_stringOnBanRemoval,true);room.clearBans();},_removeBansInterval);
_lastRoomLeavings = setInterval(function() {_lastRoomLeavingsCount=0;}, _lastRoomLeavingsInterval);
