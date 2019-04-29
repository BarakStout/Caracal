$(function() {

  var socket = io();
  var score = 0;
  var qnum = 0;
  socket.emit('connection' );

  socket.on('connected', (data) => {
    console.log(data);
    socket.emit('getHSTableData');
    getQuestionFromServer();

  });

  socket.on('answer', (data) => {
    console.log(data);
    $('#serverAnswer').html("The correct answer was: " + data.data);
    $('#serverAnswer').show();
    $('#result').show();
    if(data.correct) $('#result').html("Your answer is correct");
    else $('#result').html("Your answer is NOT correct");
    getScore();
    $('#nextVocabQuestion').show();
    qnum++;
  });

  socket.on('question', (data) => {
    console.log(data);
    $('#code').html('<code><pre>'+data.data+'</pre></code>');
    $('#thebuttonq').hide();
    $('#sendAnswer').prop('disabled', false);
    $('#sendVocabAnswer').prop('disabled', false);
    $('#myanswer').val("");
  });

  socket.on('vocabQuestion', (data) => {
    console.log(data);
    $('#nextVocabQuestion').hide();
    $('#vocab').html(data.data+"<br><br>");

    answers = "<div>"
    for(e in data.data2)
    {
      console.log(data.data2[e]);
      answers += '<input class="" type="radio" value="'+data.data2[e]+'" name="answer">';
      answers += ''+data.data2[e]+'<br>';
    }

    $('#answers').html(answers+"<br><br>");
    $('#nextVocabQuestion').hide();
    $('#sendVocabAnswer').prop('disabled', false);
    $('#myanswer').val("");
  });

  socket.on('getScore', (data) => {
    console.log(data);
    score = data.score;
    var path = window.location.pathname;
    var page = path.split("/")[1];
    page = path.split(".")[0];
    page = page.slice(1);
    $('#score').html("score: " + data.score + "<br><br><button onclick='window.location=\"sendScore.html?score="+score+"&qnum="+qnum+"&category="+page+"\"'>Submit Score</button><br><em>Only click on submit score once you reached your <b>best</b> score</em>");
    $('#thebuttonq').show();

  })

  socket.on('scoreSent', (data) => {
    console.log(data);
    document.location.href = 'index.html';
  })

  socket.on('highScoreTableData', (data) => {
    console.log(data);
     $('#highscores').empty();
    for(item in data.scores) {
      console.log(data.scores[item]);
			row = '';
			row += '<tr class="">';
      row += '<td>'+data.scores[item].Date+'</td>';
			row += '<td>'+data.scores[item].Name+'</td>';
      row += '<td>'+data.scores[item].Category+'</td>';
      row += '<td>'+data.scores[item].Qnum+'</td>';
			row += '<td>'+data.scores[item].Score+'</td>';
      row += '<td>'+parseInt(data.scores[item].Score/data.scores[item].Qnum*100)+'%</td>';
			row += '</tr>';
			$('#highscores').append(row);

    }
  });

  function getAnswerFromServer(myAnswer)
  {
    //alert('hi');
    $('#sendAnswer').prop('disabled', true);
    socket.emit('getAnswerFromServer', myAnswer);
  }

  function getVocabAnswerFromServer(myAnswer)
  {
    //console.log("answers: " + myAnswer);
    $('#sendVocabAnswer').prop('disabled', true);
    socket.emit('getVocabAnswerFromServer', myAnswer);
  }

  function getQuestionFromServer()
  {
    var path = window.location.pathname;
    var page = path.split("/")[1];
    page = path.split(".")[0];
    switch (page) {
      case "/arithmeticQuestion":
        socket.emit('getMathQuestionFromServer');
        break;
      case "/stringQuestion":
        socket.emit('getStringQuestionFromServer');
        break;
      case "/vocabQuestion":
        socket.emit('getVocabQuestionFromServer');
        break;
      default:
        break;
    }
    $('#serverAnswer').fadeOut();
    $('#result').fadeOut();
  }

  function getScore()
  {
    console.log("getting score");
    socket.emit('getScore');
  }

  function sendScoreToHSTable(name,score)
  {
    score = getQueryVariable('score');
    category = getQueryVariable('category');
    qnum = getQueryVariable('qnum');
    socket.emit('scoreSumbission', {name, category, qnum, score});
  }

  $("#thebuttonq").click(function(){getQuestionFromServer()});
  $("#nextVocabQuestion").click(function(){getQuestionFromServer()});
  $("#sendAnswer").click(function(){getAnswerFromServer($('#myanswer').val())});
  $('#sendScoreToServer').click(function(){sendScoreToHSTable($('#name').val(),score)});
  $('#sendVocabAnswer').click(function(){getVocabAnswerFromServer($('input[name="answer"]:checked').val());});
  $('#thebuttonq').hide();

});

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
