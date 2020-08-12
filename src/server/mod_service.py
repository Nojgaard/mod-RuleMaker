import asyncio
import json
from jsonschema import validate
from jsonschema import ValidationError
from jsonschema import SchemaError
import logging
import mod
import websockets

	
async def send(ws, obj):
	await ws.send(json.dumps(obj, sort_keys=False))
	
async def sendLog(ws, s):
	msgObj = {"type": "log", "data": s}
	await send(ws, msgObj)


def _loadGraph(data):
	typ = data["type"]
	arg = data["data"]
	if typ == "smiles":
		return mod.smiles(arg, add=False)
	elif typ == "graphGML": 
		return mod.graphGMLString(arg, add=False)
	else:
		msg = "Internal error: unknown graph type '%s'." % typ
		print(msg)
		raise Exception(msg)

def _loadRule(data):
	typ = data["type"]
	arg = data["data"]
	if typ == "ruleGML":
		return mod.ruleGMLString(arg, add=False)
	else:
		msg = "Internal error: unknown graph type '%s'." % typ
		print(msg)
		raise Exception(msg)

def _graphToSmiles(g):
	return {"type": "smiles", "data": g.smiles}


async def echo(ws, data, tag):
	await send(ws, {"tag": tag, "echo": data})

async def getSmiles(ws, data, tag):
	a = _loadGraph(data)
	r = _graphToSmiles(a)
	r["tag"] = tag
	await self.send(ws, r)

async def getExactMass(ws, data, tag):
	a = _loadGraph(data)
	await send(ws, {"tag": tag, "exactMass": a.exactMass})

async def getCharge(ws, data, tag):
	a = _loadGraph(data)
	c = sum(int(v.charge) for v in a.vertices)
	await send(ws, {"tag": tag, "charge": c})

async def getRuleCoords(ws, data, tag):
	a = _loadRule(data)
	d = a.getGMLString(withCoords=True)
	await send(ws, {"tag": tag, "ruleGML": d})

async def getGraphCoords(ws, data, tag):
	a = _loadGraph(data)
	d = a.getGMLString(withCoords=True)
	await send(ws, {"tag": tag, "graphGML": d})

async def doApply(ws, data, tag):
	if "labelType" not in data:
		data["labelType"] = "string"
	graphs = [_loadGraph(d) for d in data["graphs"]] 
	rules = [_loadRule(d) for d in data["rules"]]
	lt = {"string": mod.LabelType.String, "term": mod.LabelType.Term}[data["labelType"]]
	ls = mod.LabelSettings(lt, mod.LabelRelation.Specialisation)
	dg = mod.DG(graphDatabase=graphs, labelSettings=ls)
	dg.build().execute(mod.addSubset(graphs) >> rules)
	ders = []
	for e in dg.edges:
		l = [_graphToSmiles(v.graph) for v in e.sources]
		r = [_graphToSmiles(v.graph) for v in e.targets]
		rs = [a.name for a in e.rules]
		ders.append({"type": "derivation", "left": l, "right": r, "rules": rs})
	await send(ws, {"tag": tag, "derivations": ders})


graphSchema = {
	"type": "object",
	"required": ["type", "data"],
	"properties": {
		"type": {"enum": ["smiles", "graphGML"]},
		"data": {"type": "string"},
	},
}
ruleSchema = {
	"type": "object",
	"required": ["type", "data"],
	"properties": {
		"type": {"enum": ["ruleGML"]},
		"data": {"type": "string"},
	},
}

cmds = {
	"echo": {
		"schema": {"type": "string"},
		"handler": echo,
	},
	"getSmiles": {
		"schema": graphSchema,
		"handler": getSmiles,
	},
	"getExactMass": {
		"schema": graphSchema,
		"handler": getExactMass,
	},
	"getCharge": {
		"schema": graphSchema,
		"handler": getCharge,
	},
	"getGraphCoords": {
		"schema": graphSchema,
		"handler": getGraphCoords,
	},
	"getRuleCoords": {
		"schema": ruleSchema,
		"handler": getRuleCoords,
	},
	"apply": {
		"schema": {
			"type": "object",
			"required": ["graphs", "rules"],
			"properties" : {
				"graphs": {
					"type": "array",
					"items": graphSchema,
				},
				"rules": {
					"type": "array",
					"items": ruleSchema,
				},
				"labelType": { "enum": ["string", "term" ] }
			},
		},
		"handler": doApply,
	},
}


def toJson(obj):
	return json.dumps(obj, sort_keys=False, separators=(',', ':'))

def jsonObjFromHypervertex(v):
	return {"id": v.id, "name": v.graph.name}

def jsonObjFromHyperedge(e):
	sources = [{"id": v.id} for v in e.sources]
	targets = [{"id": v.id} for v in e.targets]
	return {"id": e.id, "sources": sources, "targets": targets}

def jsonObjFromDG(dg):
	edges = [jsonObjFromHyperedge(e) for e in dg.edges]
	vertices = [jsonObjFromHypervertex(v) for v in dg.vertices]
	return {"id": dg.id, "vertices": vertices, "edges": edges}

def jsonFromDG(dg):
	return toJson(jsonObjFromDG(dg))


class Server(object):
	def __init__(self, port, host="*"):
		self.host = host
		self.port = int(port)
		logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')

	def run(self):
		logging.info("Starting server on port %d", self.port)
		s = websockets.serve(Server._accept, self.host, self.port)
		asyncio.get_event_loop().run_until_complete(s)
		asyncio.get_event_loop().run_forever()

	async def _accept(ws, path):
		logging.info("Connection accepted: %s:%d%s", ws.host, ws.port, path)
		try:
			async for msgString in ws:
				try:
					msg = json.loads(msgString)
				except ValueError as e:
					logging.info("Malformed message: %s", msgString)
					logging.info("Error: %s", str(e))
					await send(ws, {"error" :"Malformed message, not JSON.\n"})
					continue
				try:
					schema = {
						"type": "object",
						"properties": {
							"tag": {},
							"cmd": {"type": "string"},
							"data": {}
						},
						"required": ["tag", "cmd", "data"]
					}
					validate(msg, schema)
				except ValidationError as e:
					await send(ws, {"error": "JSON validation error: %s" % str(e)})
					continue
				tag = msg["tag"]
				cmd = msg["cmd"]
				data = msg["data"]
				if cmd not in cmds:
					await send(ws, {"tag": tag, "error": "Unknown command '%s'." % cmd})
					continue
				else:
					c = cmds[cmd]
					try:
						validate(data, c["schema"])
						await c["handler"](ws, data, tag)
					except ValidationError as e:
						await send(ws, {"tag": tag, "error": "JSON validation error of command data: %s" % str(e)})
					except SchemaError as e:
						print("SchemaError:")
						print(e)
						await send(ws, {"tag": tag, "error": "Internal error."})
					except Exception as e:
						await send(ws, {"tag": tag, "error": "Error in command '%s': %s" % (cmd, str(e))})
		except websockets.ConnectionClosed as e:
			logging.info("Connection from %s:%d closed, code = %d, reason = '%s'.",
			             ws.host, ws.port, e.code, e.reason)



if __name__ == "__main__":
	import sys
	if len(sys.argv) < 2:
		print("Missing port number.")
		sys.exit(1)
	s = Server(sys.argv[1])
	s.run()
