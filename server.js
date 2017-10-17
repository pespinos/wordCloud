var express = require('express');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

var screenNsp = io.of('/screen-game');
var mobileNsp = io.of('/mobile-game');

var connections = [];
var wordList = [[],[],[]];
var totalCharacters= [0,0,0];
var totalWords = [0,0,0];
var screenConnected = false;

var currentList = 0;

var maxSize = 250;
var minSize = 25;

var addWordtoList = function(newWord, list){
  totalWords[list] ++;
  totalCharacters[list] += newWord.length;
  console.log('new word: '+ newWord);
  if ( wordList[list].length == 0){
    wordList[list].push({word: newWord,freq: 1});
  }
  else{
    var addWord = true;
    for(var i = 0; i < wordList[list].length; i++){
      if(!newWord.localeCompare(wordList[list][i].word)){
        console.log("this word is already on the list ");
        wordList[list][i].freq ++;
        addWord = false;
        i = wordList[list].length;
      };
    };
    if(addWord) wordList[list].push({word: newWord,freq: 1});
  };
};

var updateList = function(){
    var list = [];
    if(wordList[currentList].length != 0){
      console.log(wordList[currentList]);
      for(var i = 0; i < wordList[currentList].length; i++){
        var word = wordList[currentList][i].word;
        console.log(word);
        var avaregeLength = totalCharacters[currentList]/totalWords[currentList];
        var relativeLength = word.length/avaregeLength;
        var size = wordList[currentList][i].freq/(totalWords[currentList]*relativeLength);
        size = size*(maxSize-minSize)+minSize;
        if (size*word.length > 1080)
        size = 1080/word.length;
        list.push([word,Math.round(size)]);
      };
    }
    var msg = {wordSea: list, index: currentList};
    screenNsp.emit('update',msg);
    currentList = (currentList+1)%3;
    console.log("sending msg");
    setTimeout(function(){
      updateList();
      console.log("time to update");
    },15000);
};

var ip_server = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080 ;

//servir direcciones Web
app.get('/formulario', function(req, res){
  res.sendFile(__dirname+'/formulario.html');
});
app.get('/wordCloud', function(req, res){
  res.sendFile(__dirname+'/wordCloud.html');
});

app.use( '/js', express.static('js') );
app.use( '/css', express.static('css') );
app.use( '/assets', express.static('assets') );
app.use( '/bower_modules', express.static('bower_modules') );

screenNsp.on('connection',function(socket){
    connections.push(socket);
    if(!screenConnected)
      updateList();
      screenConnected = true;
      ;

    socket.on('disconnect', function(){
		connections.splice(connections.indexOf(socket), 1 );
  });
});

mobileNsp.on('connection',function(socket){
  console.log('mobile connected');

  socket.on('sendWord', function(msg){
    console.log("recieving a new word");
    addWordtoList(msg.word1,0);
    addWordtoList(msg.word2,1);
    addWordtoList(msg.word3,2);
  });
});

server.listen(port, function(){
  console.log("Servidor en ejecución en el puerto "+ port);
});
