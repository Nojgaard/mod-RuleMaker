# MødViz

## Installation
It is expected that you have MØD installed on your system, you have a version
of `npm` and the python modules `websocket` and `jsonschema`
```
sudo apt install npm
pip3 install websockets jsonschema
```

If you have conda installed and on a 64bit linux system, you can get all dependencies like so:
```
conda create -n modviz -c nojgaard -c conda-forge mod websockets nodejs jsonschema
conda activate modviz
```

To install package dependencies and build the package, move to the root of the
repository and run:
```
npm install
npm run build
```

To start MødViz you first need to start a MØD websocket. You do this by typing the following:
```
npm run start
```

Now you can start MødViz by opening `index.html` in your favorite browser (only tested on firefox).
