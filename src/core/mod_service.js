"use strict";

class ModService {
	constructor(host, port) {
		var self = this;
		this.ws = null
		log("Connecting to " + host + ":" + port + " ...\n");
		try {
			this.ws = new WebSocket("ws://" + host + ":" + port.toString());
		} catch(e) {
			log(e.message + "\n");
			return;
		}
		//this.ws.onopen = onopen;
		this.ws.onerror = onerror;
		this.ws.onclose = onclose;
		this.ws.onmessage = function(event) {
			try {
				var msg = JSON.parse(event.data);
				console.log("Got ", msg);
			} catch(e) {
				log("Warning: malformed message from server, '" + event.data + "'\n");
				return;
			}
			var callback = self.callback_map.get(msg.tag);
			self.callback_map.delete(msg.tag);
			callback(msg)
		}

		this.tag_id = 0;
		this.callback_map = new Map();
	}

	send(cmd, data, callback) {
		var obj = {tag: this.tag_id, cmd: cmd, data: data};
		this.callback_map.set(this.tag_id, callback.bind(this));
		this.tag_id = this.tag_id + 1;
		console.log("Sending ", obj);
		this.ws.send(JSON.stringify(obj));
	}
}

var log = function(msg) {
	console.log(msg);
}

var ws = null;
var connect = function(host, port) {
	log("Connecting to " + host + ":" + port + " ...\n");
	try {
		ws = new WebSocket("ws://" + host + ":" + port.toString());
	} catch(e) {
		log(e.message + "\n");
		return;
	}
	ws.onopen = onopen;
	ws.onerror = onerror;
	ws.onclose = onclose;
	ws.onmessage = onmessage;
}

var disconnect = function() {
	if(ws) ws.close();
}

var onerror =  function(event) {
	log("Error in websocket connection.\n");
}

var onclose = function(event) {
	log("Connection closed, code = " + event.code.toString() + ", ");
	if(event.reason == "") log("no reason.\n");
	else log("reason = " + event.reason + "\n");
}

var onmessage = function(event) {
	try {
		var msg = JSON.parse(event.data);
		console.log("Got ", msg);
	} catch(e) {
		log("Warning: malformed message from server, '" + event.data + "'\n");
		return;
	}
	log(msg);
}

var send = function(obj) {
	console.log("Sending ", obj);
	ws.send(JSON.stringify(obj));
}

var rules = [
{"type": "ruleGML", "data": `rule [
	ruleID "Keto-enol isomerization" 
	left [
		edge [ source 1 target 4 label "-" ]
		edge [ source 1 target 2 label "-" ]
		edge [ source 2 target 3 label "=" ]
	]   
	context [
		node [ id 1 label "C" ]
		node [ id 2 label "C" ]
		node [ id 3 label "O" ]
		node [ id 4 label "H" ]
	]   
	right [
		edge [ source 1 target 2 label "=" ]
		edge [ source 2 target 3 label "-" ]
		edge [ source 3 target 4 label "-" ]
	]   
]`},
{"type": "ruleGML", "data": `rule [
	ruleID "Keto-enol isomerization, inverse"
	left [
		edge [ source 0 target 1 label "=" ]
		edge [ source 1 target 2 label "-" ]
		edge [ source 2 target 3 label "-" ]
	]
	context [
		node [ id 0 label "C" ]
		node [ id 1 label "C" ]
		node [ id 2 label "O" ]
		node [ id 3 label "H" ]
	]
	right [
		edge [ source 0 target 1 label "-" ]
		edge [ source 0 target 3 label "-" ]
		edge [ source 1 target 2 label "=" ]
	]
]`},
{"type": "ruleGML", "data": `rule [
	ruleID "Aldol Addition"
	left [
		edge [ source 1 target 2 label "=" ]
		edge [ source 2 target 3 label "-" ]
		edge [ source 3 target 4 label "-" ]
		edge [ source 5 target 6 label "=" ]
	]
	context [
		node [ id 1 label "C" ]
		node [ id 2 label "C" ]
		node [ id 3 label "O" ]
		node [ id 4 label "H" ]
		node [ id 5 label "O" ]
		node [ id 6 label "C" ]
	]
	right [
		edge [ source 1 target 2 label "-" ]
		edge [ source 2 target 3 label "=" ]
		edge [ source 5 target 6 label "-" ]

		edge [ source 4 target 5 label "-" ]
		edge [ source 6 target 1 label "-" ]
	]
]`},
{"type": "ruleGML", "data": `rule [
	ruleID "Aldol Addition, inverse"
	labelType "term" # optional, indicate which label type the rule is designed for
	left [
		edge [ source 0 target 1 label "-" ]
		edge [ source 0 target 5 label "-" ]
		edge [ source 1 target 2 label "=" ]
		edge [ source 3 target 4 label "-" ]
		edge [ source 4 target 5 label "-" ]
	]
	context [
		node [ id 0 label "C" ]
		node [ id 1 label "C" ]
		node [ id 2 label "O" ]
		node [ id 3 label "H" ]
		node [ id 4 label "O" ]
		node [ id 5 label "C" ]
	]
	right [
		edge [ source 0 target 1 label "=" ]
		edge [ source 1 target 2 label "-" ]
		edge [ source 2 target 3 label "-" ]
		edge [ source 4 target 5 label "=" ]
	]
]`}
];

var onopen = function(event) {
	log("Connected\n");
	ws.send("[");
	send({notType: 42});
	send({tag: true, cmd: 'echo', data: "Hello World!"});
	send({tag: false, cmd: 'echo', data: "Hello World!"});
	send({tag: "0", cmd: 'echo', data: "Hello World!"});
	send({tag: 1, cmd: 'echo', data: "Hello World!"});
	send({tag: 2.0, cmd: 'getSmiles', data: {type: "smiles", data: "OCC"}});
	send({tag: null, cmd: 'getExactMass', data: {type: "smiles", data: "OCC"}});
	send({tag: [4], cmd: 'getExactMass', data: {type: "smiles", data: "[42O]CC"}});
	send({tag: [4], cmd: 'getExactMass', data: {type: "smiles", data: "[O+]CC"}});
	send({tag: [4], cmd: 'getExactMass', data: {type: "smiles", data: "[O]CC"}});
	send({tag: 42, cmd: 'getCharge', data: {type: "smiles", data: "C"}});
	send({tag: 42, cmd: 'getCharge', data: {type: "smiles", data: "[C+]"}});
	send({tag: 42, cmd: 'getCharge', data: {type: "smiles", data: "[C+][C-9]"}});
	send({tag: 42, cmd: 'getRuleCoords', data: rules[0]});
	send({tag: {}, cmd: 'apply', data: {
		"graphs": [
			{"type": "smiles", "data": "C=O"},
			{"type": "smiles", "data": "OCC=O"}
		],
		"rules": rules,
		"labelType": "term", // optional, valid values: "string", "term", defaults to "string"
	}});
}

const mod_service = new ModService("127.0.0.1", 5000)
export default mod_service;

//connect("127.0.0.1", 5000);
//connect("modlive.imada.sdu.dk", 8082);
