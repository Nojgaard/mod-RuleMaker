import parseLabel from './grammars/label'

const LabelType = {
    STATIC: "STATIC",
    REMOVE: "REMOVE",
    CREATE: "CREATE",
    RENAME: "RENAME"
}

class NodeData {
    constructor(label) {
        console.log("PARSING ", label);
        let data = parseLabel.parse(label);
        this.isotope = data.isotope;
        this.label = data.label;
        this.charge = data.charge;

        let isotope = this.isotope !==null ? `<sup>${this.isotope}</sup>` : "";
        let charge = this.charge !== null ? this.charge : "";
        if (charge === -1) {
            charge = "-";
        } else if (charge === 1) {
            charge = "+";
        }
        charge = `<sup>${charge}</sup>`


        this.html = `${isotope}${this.label}${charge}`;
    }

    toString() {
        let isotope = this.isotope !==null ? this.isotope : "";
        let charge = this.charge !== null ? this.charge : "";
        if (charge === -1) {
            charge = "-";
        } else if (charge === 1) {
            charge = "+";
        }
        let label = this.label;
        return `${isotope}${label}${charge}`
    }

    toHTML() {
        return this.html;
    }
}

class EdgeData {
    constructor(label) {
        this.label = label;
    }

    toString() {
        return this.label;
    }
}

class LabelData {
    constructor(rawLabel, eletype = "node") {
        this.rawLabel = rawLabel;

        let lrlbl = rawLabel.split("/");
        this.left = null;
        this.right = null;
        if (lrlbl.length === 1) {
            this.type = LabelType.STATIC;
            this.left = eletype === "node" ? new NodeData(rawLabel) : new EdgeData(rawLabel)
            this.right = this.left;
        } else if (lrlbl[0].length === 0) {
            this.type = LabelType.CREATE;
            this.right = eletype === "node" ? new NodeData(lrlbl[1]) : new EdgeData(lrlbl[1]);
        } else if (lrlbl[1].length == 0) {
            this.type = LabelType.REMOVE;
            this.left = eletype === "node" ? new NodeData(lrlbl[0]) : new EdgeData(lrlbl[0]);
        } else {
            this.type = LabelType.RENAME;
            this.left = eletype === "node" ? new NodeData(lrlbl[0]) : new EdgeData(lrlbl[0]);
            this.right = eletype === "node" ? new NodeData(lrlbl[1]) : new EdgeData(lrlbl[1]);
        }
    }

    toString() {
        if (this.type === LabelType.CREATE) {
            return this.right.toString();
        } else if (this.type === LabelType.REMOVE || this.type === LabelType.STATIC) {
            return this.left.toString();
        } else {
            return this.left.toString() + "/" + this.right.toString();
        }
    }

    toHTML() {
        if (this.type === LabelType.CREATE) {
            return this.right.toHTML();
        } else if (this.type === LabelType.REMOVE || this.type === LabelType.STATIC) {
            return this.left.toHTML();
        } else {
            return this.left.toHTML() + "/" + this.right.toHTML();
        }
    }
}

LabelData.TYPE = LabelType;

export default LabelData;