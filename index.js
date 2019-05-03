//'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const jm = require('./js/javaMath.js');
const js = require('./js/javaString.js');
const jv = require('./js/javaVocab.js');
const fs = require('fs');
const exec = require("child_process").exec;
const csv = require('csv-parser');

app.use(express.static(__dirname + '/public'));

app.get('/home', function(req, res) {
  res.render('public/home');
});

app.get('/arithmeticQuestion', function(req, res) {
  res.render('public/arithmeticQuestion');
});

app.get('/stringQuestion', function(req, res) {
  res.render('public/stringQuestion');
});

app.get('/sendScore', function(req, res) {
  res.render('public/sendScore');
});

// ------------ //
//  User Object //
// ------------ //

function User() { // public info
  this.level = 1;
  this.score = 0;
  this.answer = "";
}

User.prototype.levelUp = function() {
  this.level++;
}

User.prototype.scoreChange = function(num) {
  this.score += num;
}

var users = {};



function onConnection(socket){
  console.log("connection established with " + socket.id);
  users[socket.id]=new User();
  io.sockets.connected[socket.id].emit("connected", {
		  data: 'none'
  		});
}

function generateMathQuestion(id)
{
  filename = "TESTJSMATH_" + id.replace(/[^a-zA-Z ]/g, "");
  program = "public class "+filename + " { public static void main(String[] args) {";
  jm.resetVarNames();
  var rtn = "";
  for(i=0;i<3;i++)
    rtn += jm.declareVariable({"type":"int"}) + "";
  rtn += jm.declareVariable({"type":"double"}) + "";
  rtn += jm.mathBuilder({"numVars":users[id].level, "para": 3, "print": true, "randomValues": true});
  program += rtn + " } } ";
  fs.writeFile("./tmp/"+filename+".java", program, function(err) {
    if(err) {
        return console.log(err);
    }
    //console.log("The file was saved!");
    fs.unlink('./tmp/' + filename + ".class", (e,s,st) => {if(e) console.log("no class file"); else console.log("file deleted");});
    exec('javac ./tmp/' + filename + ".java", (error, stdout, stderr) => { } );

    // https://github.com/google/google-java-format
    exec('java -jar lib/google-java-format-1.7-all-deps.jar --replace tmp/'+filename+'.java',
      (error, stdout, stderr) => {
        getQuestion(id);
    });

  });

}

function generateStringQuestion(id)
{
  filename = "TESTJSMATH_" + id.replace(/[^a-zA-Z ]/g, "");
  program = "public class "+filename + " { \n public static void main(String[] args) \n {";
  //js.loadJson("quotes");
  //console.log(users[id]);
  if(users[id].level > 9 && users[id].level % 5 == 0) js.lvlUp();
  if(users[id].level < 0) js.lvlDown();
  js.resetVarNames();
  var rtn = "";
  rtn += js.declareVariable() + "";
  if(Math.random()>0.33)
    rtn += js.question("length");
  else if(Math.random() > 0.5)
    rtn += js.question("sub1");
  else
    rtn += js.question("sub2");
  program += rtn + " } } ";
  fs.writeFile("./tmp/"+filename+".java", program, function(err) {
    if(err) {
        return console.log(err);
    }
    //console.log("The file was saved!");
    fs.unlink('./tmp/' + filename + ".class", (e,s,st) => {if(e) console.log("no class file"); else console.log("file deleted");});
    exec('javac ./tmp/' + filename + ".java", (error, stdout, stderr) => { } );

    // https://github.com/google/google-java-format
    exec('java -jar lib/google-java-format-1.7-all-deps.jar --replace tmp/'+filename+'.java',
      (error, stdout, stderr) => {
        getQuestion(id);
    });

  });
}

function generateVocabQuestion(id)
{
  console.log("vocab question >>>> ");
  vocabQuestion = jv.getRandomVocab();
  console.log(vocabQuestion);
  vocab = vocabQuestion["question"];
  users[id].answer = vocabQuestion["answer"];
  answers = vocabQuestion["choices"];
  io.sockets.connected[id].emit("vocabQuestion", {
      data: vocab,
      data2: answers
  });
}

function getQuestion(id)
{
  console.log("reading file");
  fs.readFile('./tmp/'+filename+'.java', 'utf8', function(err, contents) {
    if(err) console.log(err);
    else
    {
    console.log(contents);
    io.sockets.connected[id].emit("question", {
  		  data: contents
  	});
  }
  });
}

function getRightAnswer(id, data)
{
  filename = "TESTJSMATH_" + id.replace(/[^a-zA-Z ]/g, "");
  console.log("looking for: " + "./tmp/" + filename + ".class");
  //if (!fs.existsSync("./tmp/" + filename + ".class")) {return;}
  console.log("found file");
  cmd = 'java -cp ./tmp ' + filename;
  console.log("run" + cmd);
  var answer = "";
  exec(cmd, (error, stdout, stderr) => {
    answer = stdout;
    //answer = answer.trim();
    if(answer.indexOf('.') != -1) answer = parseFloat(answer).toFixed(2);
    if(!isNaN(answer) && answer.indexOf('.') == -1) answer = parseInt(answer);
    if(isNaN(answer))
    {
      io.sockets.connected[id].emit("answer", {
          data: answer,
          correct: true
        });
        users[id].scoreChange(+1);
        users[id].levelUp();
        return;
    }
    console.log("The answer was: " + answer);
    console.log("answer: " + answer + " data: " + data + " ans: " + (answer == data));
        console.log(`stderr: ${stderr}`);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    if(answer == data)
    {
      users[id].scoreChange(+1);
      users[id].levelUp();
    }
    else users[id].scoreChange(-1);
  io.sockets.connected[id].emit("answer", {
		  data: answer,
      correct: answer == data
		});

  });

}

function getVocabAnswer(id, data)
{

  corr = (users[id].answer).trim().localeCompare(data.trim());
  if(corr == 0) users[id].scoreChange(+1);
  else users[id].scoreChange(-1);
  io.sockets.connected[id].emit("answer", {
    data: users[id].answer,
    correct: corr == 0
  });

}


io.on('connection', function (socket) {
  onConnection(socket);

  socket.on('getAnswerFromServer', function(data) {
    getRightAnswer(socket.id, data)}
  );

  socket.on('getVocabAnswerFromServer', function(data) {
    getVocabAnswer(socket.id, data)}
  );

  socket.on('getMathQuestionFromServer', function() {
    generateMathQuestion(socket.id);
  });

  socket.on('getStringQuestionFromServer', function() {
    generateStringQuestion(socket.id);
  });

  socket.on('getVocabQuestionFromServer', function() {
    generateVocabQuestion(socket.id);
  });

  socket.on('disconnect', function () {
    console.log("lost client " + socket.id);
    jm.resetVarNames();
    filename = "./tmp/TESTJSMATH_" + socket.id.replace(/[^a-zA-Z ]/g, "") + ".java";
    console.log("delete " + filename);
    try{fs.unlinkSync(filename);}catch(err){};

  });

  socket.on('getScore', function () {
    //console.log("score inqury");
    io.sockets.connected[socket.id].emit("getScore", {
  		  score: users[socket.id].score
  		});
  });

  socket.on('scoreSumbission', function(data) {
    //console.log('got score and name');
    //console.log(data);
    //console.log("name: " + name + " score: " + users[socket.id].score);
    var nowDate = new Date();
    var date = (nowDate.getMonth()+1)+'-'+nowDate.getDate() + "-"+ nowDate.getFullYear();
    switch (data.category) {
      case "arithmeticQuestion": category = "Arithmetic"; break;
      case "stringQuestion": category = "Strings"; break;
      case "vocabQuestion": category = "Vocabulary"; break;
    }
    str = date + "," + data.name + "," + category + "," + data.qnum + "," + data.score + "\n";
    //console.log(str);
    fs.appendFile('data/highscores.csv', str, function (err) {
      if (err) throw err;
      //console.log('Saved!');
    });
    io.sockets.connected[socket.id].emit("scoreSent", {
      score: "blah"
  		});
  });

  socket.on('getHSTableData', function () {
    //console.log("get high score table");
    var rtn = [];
    fs.createReadStream('data/highscores.csv')
      .pipe(csv())
      .on('data', (row) => {
        rtn.push(row);
        //console.log(row);
      })
      .on('end', () => {
        //console.log('CSV file successfully processed');
        rtn.sort(function(a,b){
            if (a["Score"] > b["Score"])
              return -1;
            if (a["Score"] < b["Score"])
              return 1;
            return 0;
          });
        io.sockets.connected[socket.id].emit("highScoreTableData", {
            scores: rtn
          });
      });
  });

});

http.listen(port, () => console.log('listening on port ' + port));
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})
