# MødViz

## Installation
It is expected that you have MØD installed on your system, you have a version
of `npm` and that the python `websocket` module is installed.
```
sudo apt install npm
pip3 install websocket
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
