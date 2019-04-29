
var OP = ['+','-','*','/','%'];
var VAR_NAMES = [ 'a', 'b', 'c', 'd', 'e' ]; //options for var names

var knownVariables = []; // assigned variables
var varWithTypes = {};

module.exports = {

  resetVarNames: function() {VAR_NAMES = [ 'a', 'b', 'c', 'd', 'e' ];},

  // Input: options array {type, [name], [value]}
  // Output: java declration of variable
  declareVariable: function(options)
  {
    rtn = options.type + " ";
    if(typeof(options.name) == "undefined")
    {
      rtn += VAR_NAMES.splice(Math.floor(Math.random()*VAR_NAMES.length), 1);
    }
    else
      rtn += options.name;
    knownVariables.push(rtn.split(" ")[1]);
    varWithTypes[rtn.split(" ")[1]] = options.type;
    if(typeof(options.value) !== "undefined")
      rtn += " = " + options.value;
    if(typeof(options.randomValues !== "undefined"))
      if(options.type == "double")
        rtn += " = " + Number(this.randomInRange(-10,10).toFixed(Math.random()*3));
      else
        rtn += " = " + parseInt(this.randomInRange(-10,10));
    return rtn + ";" ;

  },

  // Input: options array {numVars, [para], [assing:true or print:true or println:true] }
  // Output: java math statement
  mathBuilder: function(options)
  {
    rtn = "";
    openParaCount = 0;
    closeParaCount = 0;
    justaddedPara = false;
    casted = false;
    for(i=0;i<options.numVars;i++)
    {
      if(typeof(options.para) !== "undefined" && options.para != openParaCount && Math.random() > 0.5)
      {
        rtn += "(";
        openParaCount++;
        justaddedPara = true;
      }
      v = knownVariables[Math.floor(Math.random()*knownVariables.length)];
      if(options.cast && Math.random() > 0.5)
      {
          casted = true;
          cast = "(double)";
          if(varWithTypes[v] == "double") cast = "(int)";
          if(Math.random() > 0.7)
            v = cast + "(" + v + ")";
          else
            if(Math.random() > 0.5)
            {
              v = cast + "(" + v;
              openParaCount++;
              justaddedPara = true;
            }
      }
      rtn += v;
      if(!justaddedPara && typeof(options.cast) != "undefined" && openParaCount > closeParaCount)
      {console.log("me");
        rtn += ")";
        justaddedPara = false;
        closeParaCount++;
      }
      if(!justaddedPara && typeof(options.para) !== "undefined" && openParaCount > closeParaCount && Math.random() > 0.5)
      {
        rtn += ")";
        closeParaCount++;
        justaddedPara = false;
      }
      if(i+1 != options.numVars)
      {
        rtn += " " + OP[Math.floor(Math.random()*OP.length)] + " ";
        if(typeof(options.para) !== "undefined" && options.para != openParaCount && Math.random() > 0.5)
        {
          rtn += "(";
          openParaCount++;
          justaddedPara = true;
        } else justaddedPara = false;
      }
    }
    while(openParaCount != closeParaCount) { rtn += ")"; closeParaCount++; }
    if(options.cast && !casted)
      if(Math.random() > 0.5) rtn = "(double)" + rtn;
      else if(Math.random() > 0.5) rtn = "(int) ("+rtn+")";
      else rtn = "(int)" + rtn;
    if(options.assign)
      rtn = knownVariables[Math.floor(Math.random()*knownVariables.length)] + " = " + rtn;
    if(options.print)
        rtn = this.printThis(rtn);
    if(options.println)
      rtn = printlnThis(rtn);
    return rtn;
  },


  printThis: function (str)
  {
    return "System.out.println(" + str + ");";
  },

  printlnThis: function (str)
  {
    return "System.out.println(" + str + ");";
  },

  // stack overflow
  isLetter: function (str) {
    return str.length === 1 && str.match(/[a-z]/i);
  },

  // stack overflow
  randomInRange: function (min, max) {
    return Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);
  }

}

// Example usage of declareVariable()
/*
console.log(declareVariable({"type":"int"}));
console.log(declareVariable({"type":"int","name":"bob"}));
console.log(declareVariable({"type":"int","value":"44"}));
console.log(declareVariable({"type": "double"}));
/*
// Example usage of mathBuilder()
/*
console.log(mathBuilder({"numVars":2}));
console.log(mathBuilder({"numVars":3}));
console.log(mathBuilder({"numVars":3, "assign": true}));
console.log(mathBuilder({"numVars":3, "print": true}));
console.log(mathBuilder({"numVars":3, "println": true}));
console.log(mathBuilder({"numVars":3, "para":1}));
console.log(mathBuilder({"numVars":10, "para":5}));
*/
//console.log(mathBuilder({"numVars":3}));
//console.log(mathBuilder({"numVars":3, "cast": true}));

// TODO:
// casting as a seprate function?
// use all declared variables?
// assign to a variable selected
