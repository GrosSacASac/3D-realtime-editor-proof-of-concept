/**/
"use strict"
const 
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    socketIo = require('socket.io'),
    R = require('ramda'); 
    

const mimeDictionairy = {//add more as you need
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.jpg': 'image/jpeg'
};

//initial
let cameraInfo = {
    "rotation": {
        "x":0.23,"y":11.69,"z":0
    },
    "position": {
        "x":16,"y":4.1,"z":-10.2
    }},
    boxes = {},
    spheres = {};


const server = http.createServer(function(request, response) {

    let filePath = request.url,
        extname,
        contentType;
    if (filePath === '/') {
        filePath = './index.html';
    } else {
        filePath = './' + filePath;
    }

    extname = path.extname(filePath);
    contentType = mimeDictionairy[extname];
    //contentType ex: 'text/html'
        
    fs.readFile(filePath, function(error, content) {
        if (error) {
            console.log(`file ${filePath} not found`);
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end("404", 'utf-8');
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

const io = socketIo(server);

io.on('connection', function (socket) {
    socket.emit("setCameraInfo", cameraInfo);
    R.map(function(box) {
        socket.emit("addBox", box);
    }, boxes);
    R.map(function(sphere) {
        socket.emit("addSphere", sphere);
    }, spheres);
    
    
    
    socket.on("setCameraInfo", function(newCameraInfo) {
        // put here more tests to see if newCameraInfo is safe to resend to all other clients
        cameraInfo = newCameraInfo;
        socket.broadcast.emit("setCameraInfo", cameraInfo);
    });
    socket.on("addBox", function(box) {
        boxes[box.name] = box;
        socket.broadcast.emit("addBox", box);
    });
    socket.on("addSphere", function(sphere) {
        spheres[sphere.name] = sphere;
        socket.broadcast.emit("addSphere", sphere);
    });
    socket.on("deleteAll", function() {
        boxes = {};
        spheres = {};
        socket.broadcast.emit("deleteAll", {});
    });
    socket.on("edit", function(data) {
        /*data = {
            what String(scaling, position, rotation)
            name: selectedName,
            type: selectedType
            x , y, z
        }*/
        var what = data.what,
            collection;
        
        if (data.type === "box") {
            collection = boxes;
        } else if (data.type === "sphere") {
            collection = spheres;
        }
        if (!collection[data.name]) {
            return;
        }
        collection[data.name][what].x = parseFloat(collection[data.name][what].x) + data.x;
        collection[data.name][what].y = parseFloat(collection[data.name][what].y) + data.y;
        collection[data.name][what].z = parseFloat(collection[data.name][what].z) + data.z;
    
        socket.broadcast.emit("edit", data);
    });
});

let PORT = process.env.PORT || 8080;
server.listen(PORT);
console.log('visit http://localhost:'+ PORT);