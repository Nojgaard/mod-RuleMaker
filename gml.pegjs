start
  = "rule" _ "[" _ "ruleId" _ rule_id:string _ "left" _ left:container _ "context" _ context:container _ "right" _ right:container _ "]" _ { return {id: rule_id, left: left, context: context, right: right}; }

container
  = "[" _ node_list:(node)* _ edge_list:(edge)* _ "]" { return {nodes: node_list, edges: edge_list} }

node
  = _ "node" _ "[" _ "id" _ id:integer _ "label" _ lbl:string _ "]" { return {id: id, label: lbl}; }

edge
  = _ "edge" _ "[" _ "source" _ src:integer _ "target" _ tar:integer _ "label" _ lbl:string _ "]" { return {src: src, tar: tar, label: lbl}; }

string
  = "\"" str:[a-zA-Z0-9\=\-#/ ]* "\"" { return str.join(""); }

integer "integer"
  =  digits:[0-9]+  { return parseInt(digits.join(""), 10); }

  // optional whitespace
_  = [ \t\r\n]*

// mandatory whitespace
__ = [ \t\r\n]+