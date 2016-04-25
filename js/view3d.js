/*BABYLON, dom99, R, bridge, view2d, */
var view3d = (function () {
    "use strict";
    var D = dom99,
        B = BABYLON;
    var canvas,
        camera,
        camera1,
        camera2,
        material1,
        selectedMaterial,
        engine,
        scene,
        boxes = {},
        spheres = {},
        selected,
        selectedName,
        selectedType,
        previousData = {x:0,y:0,z:0},
        editPreviewFinished = true,
        lastFrameCamera = {rotation:{},position:{}},
        renderLoopCount = 20,
        cameraPrecision = 0.1;

    var createScene = function () {
        var scene = new B.Scene(engine);

        camera1 = new B.WebVRFreeCamera("WebVRFreeCamera", new B.Vector3(0, 1, -15), scene);
        //camera1.attachControl(canvas, true);
        camera1.checkCollisions = true;
        camera1.ellipsoid = new B.Vector3(1, 1, 1);
        
        camera2 = new B.FreeCamera("FreeCamera", new B.Vector3(0, 1, -15), scene);
        camera2.attachControl(canvas, true);
        camera2.checkCollisions = true;
        camera2.ellipsoid = new B.Vector3(1, 1, 1);
        
        camera = camera2;
        scene.activeCamera = camera;
        var light = new B.HemisphericLight("hemi", new B.Vector3(0, 1, 0), scene);
        
        material1 = new B.StandardMaterial("material1", scene);
        material1.diffuseTexture = new B.Texture("images/t1.jpg", scene);
        selectedMaterial = new B.StandardMaterial("selectedMaterial", scene);
        selectedMaterial.emissiveColor = new B.Color3(1, 1, 1);
        
        
        // Skybox
        var skybox = B.Mesh.CreateBox("skyBox", 4000.0, scene);
        var skyboxMaterial = new B.StandardMaterial("skyBox", scene);
        skybox.position.y = 2000;
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new B.CubeTexture("images/sky/sky1.jpg", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = B.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new B.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new B.Color3(10, 10, 10);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        
        //Ground
        var ground = B.Mesh.CreatePlane("ground", 4000.0, scene);
        ground.position = new B.Vector3(0, -0.1, 0);
        ground.rotation = new B.Vector3(Math.PI / 2, 0, 0);
        ground.checkCollisions = true;    
        
        
        //When pointer down event is raised
        scene.onPointerDown = function (evt, pickResult) {
            // if the click hits the ground object, we change the impact position
            if (!pickResult.hit) {
                return;
            }
            
            if (Object.keys(boxes).some(function(name) {
                    if (boxes[name] === pickResult.pickedMesh) {
                        selectedName = name;
                        selectedType = "box";
                        return true;
                    }
                }) ||
                Object.keys(spheres).some(function(name) {
                    if (spheres[name] === pickResult.pickedMesh) {
                        selectedName = name;
                        selectedType = "sphere";
                        return true;
                    }
                })) {
                
                editPreviewCancel();
                if (selected) {//unselect old
                    selected.material = material1;
                }
                selected = pickResult.pickedMesh;
                selected.material = selectedMaterial;
            }
            
        };
        return scene;
    }
    var start = function() {
        canvas = D.el.canvas;
        engine = new B.Engine(canvas, true);
        scene = createScene();

        Object.assign(lastFrameCamera.rotation, camera.rotation);
        Object.assign(lastFrameCamera.position, camera.position);
        engine.runRenderLoop(function () {
            //camera.position.x += 0.01;
            scene.render();
            renderLoopCount -= 1;
            if (renderLoopCount === 0){
                if (
                    (Math.abs(lastFrameCamera.rotation.x - camera.rotation.x) > cameraPrecision) ||
                    (Math.abs(lastFrameCamera.rotation.y - camera.rotation.y) > cameraPrecision) ||
                    (Math.abs(lastFrameCamera.rotation.z - camera.rotation.z) > cameraPrecision) ||
                    (Math.abs(lastFrameCamera.position.x - camera.position.x) > cameraPrecision) ||
                    (Math.abs(lastFrameCamera.position.y - camera.position.y) > cameraPrecision) ||
                    (Math.abs(lastFrameCamera.position.z - camera.position.z) > cameraPrecision)
                    ) {
                    //could limit the number of updates per seconds
                    bridge.updateServerState("setCameraInfo", {
                        "rotation": camera.rotation,
                        "position": camera.position
                    });
                    
                }
                
                Object.assign(lastFrameCamera.rotation, camera.rotation);
                Object.assign(lastFrameCamera.position, camera.position);
                renderLoopCount = 5;
            }

        });
    };
    var switchCamera = function () {
        if (camera === camera2) {
            camera = camera1;
            camera2.detachControl(canvas);
            camera.position = camera2.position.clone();
            camera.rotation = camera2.rotation.clone();
        } else {
            camera = camera2;
            camera1.detachControl(canvas);
            camera.position = camera1.position.clone();
            camera.rotation = camera1.rotation.clone();
        }
        scene.activeCamera = camera;
        camera.attachControl(canvas);
    };
    
    var setCameraInfo = function (data) {
        renderLoopCount = 25;
        Object.assign(camera.rotation, data.rotation);
        Object.assign(camera.position, data.position);
        Object.assign(lastFrameCamera.rotation, camera.rotation);
        Object.assign(lastFrameCamera.position, camera.position);
        
    };
    
    var addBox = function (data) {
    /*all have .x .y and .z
    data.name
    data.rotation 
    data.position
    data.scaling*/
        var box1 = B.Mesh.CreateBox("box1", 1.0, scene);
        Object.assign(box1.rotation, data.rotation);
        Object.assign(box1.position, data.position);
        Object.assign(box1.scaling, data.scaling);
        box1.material = material1;
        boxes[data.name] = box1;
    };
    
    var addSphere = function (data) {
    /*all have .x .y and .z
    data.rotation 
    data.position
    data.scaling*/
        var sphere = B.Mesh.CreateSphere("sphere", 10.0, 1, scene);
        Object.assign(sphere.rotation, data.rotation);
        Object.assign(sphere.position, data.position);
        Object.assign(sphere.scaling, data.scaling);
        sphere.material = material1;
        spheres[data.name] = sphere;
    };
    
    var deleteAll = function (data) {
        boxes.forEach(function(mesh) {
            mesh.dispose();
        });
        spheres.forEach(function(mesh) {
            mesh.dispose();
        });
        boxes = {};
        spheres = {};
        //todo remove selection
    };
    
    var getSelection = function() {
        return {
            type: selectedType,
            name: selectedName
        };
    };
    
    var edit = function (data) {
        /* data.what what transform ? String(scaling, position, rotation)
        data.x .y .z
        
        selected[what].x .y .z is a string -->
        */
        var what = data.what,
            collection;
        if (data.type) {
            //comes from server, we directly change
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
        } else if (selected) {
            //user, we change current selection
            selected[what].x = parseFloat(selected[what].x, 10) + data.x;
            selected[what].y = parseFloat(selected[what].y, 10) + data.y;
            selected[what].z = parseFloat(selected[what].z, 10) + data.z;
        }   
        
    };
    var editPreview = function (data) {
        /* data.what what transform ? String(scaling, position, rotation)
        data.x .y .z
        
        selected[what].x .y .z is a string -->
        */
        editPreviewFinished = false;
        var difference = {
            what: data.what,
            x: data.x - previousData.x,
            y: data.y - previousData.y,
            z: data.z - previousData.z
        }
        edit(difference);
        previousData = data;
        
    };
    
    var editPreviewCancel = function (success) {
        /*editPreviewFinished to only cancel once 
        if there is success we stay as is*/
        if (!editPreviewFinished && !success) {
            var difference = {
                what: previousData.what,
                x: -previousData.x,
                y: -previousData.y,
                z: -previousData.z
            }
            edit(difference);
            view2d.terminateCurrentAction();
        }
        previousData = {x:0,y:0,z:0};
        editPreviewFinished = true;
        return getSelection();
    };
    
    
    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
    return {
        start: start,
        setCameraInfo: setCameraInfo,
        switchCamera: switchCamera,
        addBox: addBox,
        addSphere: addSphere,
        edit: edit,
        editPreview: editPreview,
        editPreviewCancel: editPreviewCancel,
        getSelection: getSelection,
        deleteAll: deleteAll
    };
}());