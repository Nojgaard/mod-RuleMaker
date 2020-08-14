start
  = isotope:integer? label:string charge:(chargedbl/chargen)?
  { return {
      isotope: isotope,
      label: label,
      charge: charge
  }
  }

chargen
  = sign:("+"/"-") n:integer? { 
    if (n === null) { 
      n = 1;
    }
    return sign === "+" ? n : -1 * n; 
    }

chargedbl
  = charge:("++"/"--") { return charge==="++"?2:-2; }

integer 
  =  digits:[0-9]+  { return parseInt(digits.join(""), 10); }

string
  = str:[a-zA-Z\=#/&()_ ]+ { return str.join(""); }