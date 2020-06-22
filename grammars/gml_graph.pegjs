start
  = "graph" _ "[" _ node_list:(node)* _ edge_list:(edge)* _ "]" _ { return {nodes: node_list, edges: edge_list} }

node
  = _ "node" _ "[" _ "id" _ id:integer _ "label" _ lbl:string _ pos:coord? _ "]" _ { return {id: id, label: lbl, position: pos}; }

edge
  = _ "edge" _ "[" _ "source" _ src:integer _ "target" _ tar:integer _ "label" _ lbl:string _ "]" _ { return {src: src, tar: tar, label: lbl}; }

coord
  = "vis2d" _ "[" _ "x" _ x:float _ "y" _ y:float _ "]" { return {x: x, y: y}; }

string
  = "\"" str:[a-zA-Z0-9\+\=\-#/& ]* "\"" { return str.join(""); }

integer "integer"
  =  digits:[0-9]+  { return parseInt(digits.join(""), 10); }

float "float"
    = digits:("-"? [0-9]+ ("." [0-9]+)? ("e" [+-]? [0-9]+)?) {
      digits = digits.flat(5);
      return parseFloat(digits.join(""));
    }

// float "float"
//     = minus:"-"? left:[0-9]+ right:("." [0-9]+)? {
//       var str = "";
//       if (minus) { 
//         str = "-";
//       }
  
//       str = str.concat(left.join(""));
//       if (right) { 
//         str = str.concat(right.join("")); 
//       }
//       return parseFloat(str);
//     }

  // optional whitespace
_  = [ \t\r\n]*

// mandatory whitespace
__ = [ \t\r\n]+