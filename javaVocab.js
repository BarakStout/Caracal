const fs = require('fs');
fs.readFile('APCompSciAVocab.json', 'utf8', function(err, contents) {
  if(err) console.log(err);
  else vocabs = JSON.parse(contents);
});

var shuffle = require('shuffle-array');

var lvl = 1;
var vocab = "";
var ranswer = "";
var fakeAnswers = [];

module.exports = {


  // Input: options array {[name], [value]}
  // Output: java declration of variable
  getRandomVocab: function()
  {
    x = Math.floor(Math.random()*vocabs.length);
    console.log(x);
    console.log(vocabs[x]);
    vocab = vocabs[x]["Term"];
    ranswer = vocabs[x]["Definition"];
    i=0;
    while(i<4)
    {
      y = Math.floor(Math.random()*vocabs.length);
      if (y != x)
      {
        fakeAnswers[i] = vocabs[y]["Definition"];
        i++;
      }
    }
    fakeAnswers[i] = vocabs[x]["Definition"];
    shuffle(fakeAnswers);
    return vocab;

  },

  getCorrectAnswer: function()
  {
    return ranswer;
  },

  getFakeAnswers: function()
  {
    return fakeAnswers;
  }
}
