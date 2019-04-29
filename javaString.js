var knownVariables = []; // assigned variables

const fs = require('fs');
fs.readFile('quotes.json', 'utf8', function(err, contents) {
  if(err) console.log(err);
  else strings = JSON.parse(contents);
});

var lvl = 1 ;
var lastLength = 0;
///////////////////////////////////////////////////// Random sentence

// Modifed from https://codepen.io/anon/pen/OGqZvV

var verbs, nouns, adjectives, adverbs, preposition;
nouns = ["bird", "clock", "boy", "plastic", "duck", "teacher", "old lady", "professor", "hamster", "dog"];
verbs = ["kicked", "ran", "flew", "dodged", "sliced", "rolled", "died", "breathed", "slept", "killed"];
adjectives = ["beautiful", "lazy", "professional", "lovely", "dumb", "rough", "soft", "hot", "vibrating", "slimy"];
adverbs = ["slowly", "elegantly", "precisely", "quickly", "sadly", "humbly", "proudly", "shockingly", "calmly", "passionately"];
preposition = ["down", "into", "up", "on", "upon", "below", "above", "through", "across", "towards"];

function randGen() {
  return Math.floor(Math.random() * 5);
}

function sentence() {
  var rand1 = Math.floor(Math.random() * 10);
  var rand2 = Math.floor(Math.random() * 10);
  var rand3 = Math.floor(Math.random() * 10);
  var rand4 = Math.floor(Math.random() * 10);
  var rand5 = Math.floor(Math.random() * 10);
  var rand6 = Math.floor(Math.random() * 10);
  var content = "";
  switch (lvl) {
    case 1:
      content += "The " + adjectives[rand1];
      break;
    case 2:
      content += "The " + adjectives[rand1] + " " + nouns[rand2];
      break;
    case 3:
      content += "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3];
      break;
    case 4:
      content += "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3] + " " + verbs[rand4];
      break;
    case 5:
      content += "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3] + " " + verbs[rand4] + " because some " + nouns[rand1];
      break;
    case 6:
      content += "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3] + " " + verbs[rand4] + " because some " + nouns[rand1] + " " + adverbs[rand1];
      break;
    default:
      content += "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3] + " " + verbs[rand4] + " because some " + nouns[rand1] + " " + adverbs[rand1] + " " + verbs[rand1] + " " + preposition[rand1] + " a " + adjectives[rand2] + " " + nouns[rand5] + " which, became a " + adjectives[rand3] + ", " + adjectives[rand4] + " " + nouns[rand6] + ".";
      break;
  }
  lastLength = content.length;
  return content;
}
////////////////////////////////////////////////////

function printlnThis(str)
{
  return "System.out.print(" + str + ");";
}

module.exports = {

  resetVarNames: function() {VAR_NAMES = [ 'str1', 'str2', 'str3', 'str4', 'str5' ];},

  // Input: options array {[name], [value]}
  // Output: java declration of variable
  declareVariable: function(options)
  {
    knownVariables = [];
    rtn = "String ";
    if(typeof options == 'undefined')
    {
      rtn += VAR_NAMES.splice(Math.floor(Math.random()*VAR_NAMES.length), 1);
    }
    else
      rtn += options.name;
    knownVariables.push(rtn.split(" ")[1]);
    if(typeof options !== 'undefined' && typeof(options.value) !== "undefined")
      rtn += " = " + options.value;
    else
    {
      console.log("lvl: " + lvl);
      if(lvl > 5 && Math.random() < .5 && strings)
      {
        randString = strings["quotes"][Math.floor(Math.random()*strings["quotes"].length)]["quote"];
        lastLength = randString.length;
        rtn += " = \"" + randString +'"';
      } else {
        rtn += " = \"" + sentence() + "\"";
      }
    }
    return rtn + ";" ;

  },

  /*
    length
    sub 1
    sub 2
    escape seque
  */
  question: function(type)
  {
    rtn = "";
    switch (type) {
      case "length":
        rtn += printlnThis(knownVariables[Math.floor(Math.random()*knownVariables.length)]+".length()");
        break;
      case "sub1":
        x = Math.floor(Math.random()*knownVariables.length);
        rtn += printlnThis(""+knownVariables[x]+".substring("+Math.floor(Math.random()*lastLength)+")");
        break;
      case "sub2":
        x = Math.floor(Math.random()*knownVariables.length);
        a = Math.floor(Math.random()*lastLength);
        b = Math.floor(Math.random()*(lastLength-a)) + a;
        rtn += printlnThis(""+knownVariables[x]+".substring("+a+","+b+")");
        console.log(rtn);
        break;
      default:
        break;
    }
    return rtn;
  },

  lvlUp: function() { if(lvl<6) lvl++; },
  lvlDown: function() { if(lvl > 0) lvl--; },

  printThis: function (str)
  {
    return "System.out.println(" + str + ");";
  },

  printlnThis: function (str)
  {
    return "System.out.println(" + str + ");";
  }

}
