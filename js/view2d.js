/*dom99, bridge, screen, Date*/
var view2d = (function () {
    "use strict";
    var D = dom99,
        BOOL = {"false": false, "true": true};
    var currentAction = "",
        keyToAction = {
            "S": "scaling",
            "R": "rotation",
            "G": "position"
        },
        screenX,
        screenY,
        startX, 
        startY,
        step = 0.1,
        usingMouse = true;
        
    var enterFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    };
    // server event listeners
    // none

    
    // UI event listeners
    D.fx.showCommands = function (event) {
        D.el.commands.classList.toggle("inactive");
    };
    
    D.fx.switchCamera = function (event) {
        
        D.el.editing.classList.toggle("hidden");
        enterFullScreen();
        view3d.switchCamera();
    };
    
    D.fx.addBox = function (event) {
        D.vr.name = String(Date.now());
        view3d.addBox(D.vr);
        bridge.updateServerState("addBox", D.vr);
        D.vr.lastAction = "Box added !";
    };    
    
    D.fx.addSphere = function (event) {
        D.vr.name = String(Date.now());
        view3d.addSphere(D.vr);
        bridge.updateServerState("addSphere", D.vr);
        D.vr.lastAction = "Sphere added !";
    };
    
    D.fx.deleteAll = function (event) {
        view3d.deleteAll(D.vr);
        bridge.updateServerState("deleteAll", {});
        D.vr.lastAction = "deleteAll !";
    };
    
    var getDataMeasures = function() {
        return {
            what: keyToAction[currentAction],
            x: BOOL[D.vr.isX] ? parseFloat(D.vr.howMuch): 0,
            y: BOOL[D.vr.isY] ? parseFloat(D.vr.howMuch): 0,
            z: BOOL[D.vr.isZ] ? parseFloat(D.vr.howMuch): 0
        }
    };
    
    var tryRefreshEditPreview = function() {
        if ((currentAction in keyToAction) && !isNaN(parseFloat(D.vr.howMuch))){
            
            view3d.editPreview(getDataMeasures());
        }
    };
    
    D.fx.useInput = function (event) {
        usingMouse = false; // using input instead
        tryRefreshEditPreview();
    };
    
    D.fx.useMouseMouvementAsInput = function (event) {
        var distance;
            
        screenX = event.screenX;
        screenY = event.screenY;
        if ((currentAction in keyToAction) && usingMouse) {
            distance = Math.pow((
                Math.pow(Math.abs(startX - screenX),2) + 
                Math.pow(Math.abs(startY - screenY),2)
                ), 0.5);
            D.vr.howMuch = (screenX*8/screen.width)-4 //old(-distance  * 4/ screen.width) + 2;
            tryRefreshEditPreview();
        }
    };
    
    var captureCurrentMousePosition = function() {
        usingMouse = true;
        startX = screenX;
        startY = screenY;
    };
    
    var terminateCurrentAction = function() {
        currentAction = "";
        D.vr.helpMessage = "";
    }
    
    D.fx.tryShortCut = function (event) {
        var pressedKey = String.fromCharCode(event.keyCode);
        
        var startNewEditPreview = function(message) {
            if (!view3d.getSelection().name) {
                D.vr.helpMessage = "Nothing is selected";
                return;
            }
            view3d.editPreviewCancel();
            currentAction = pressedKey;
            captureCurrentMousePosition();
            D.vr.helpMessage = message;
        };
        
        var confirmEditPreview = function() {
            if (isNaN(parseFloat(D.vr.howMuch))) {
                D.vr.helpMessage += "Value is invalid";
                return;
            }
            var data = getDataMeasures();
            Object.assign(data, view3d.editPreviewCancel(true));
            bridge.updateServerState("edit", data);
            terminateCurrentAction();
        };
        
        if (pressedKey === "S") {//Scale
            if (currentAction !== pressedKey) {
                startNewEditPreview("S to confirm");
            } else {
                confirmEditPreview();
            }
            event.preventDefault();
            
        } else if (pressedKey === "G") { //Grab
            if (currentAction !== pressedKey) {
                startNewEditPreview("G to confirm");
            } else {
                confirmEditPreview();
            }
            event.preventDefault();
        } else if (pressedKey === "R") { //Rotate
            if (currentAction !== pressedKey) {
                startNewEditPreview("R to confirm");
            } else {
                confirmEditPreview();
            }
            event.preventDefault();
        } else if (pressedKey === "X") {
            D.vr.isX = !BOOL[D.vr.isX];
            tryRefreshEditPreview();
            event.preventDefault();
        } else if (pressedKey === "Y") {
            D.vr.isY = !BOOL[D.vr.isY];
            tryRefreshEditPreview();
            event.preventDefault();
        } else if (pressedKey === "Z") {
            D.vr.isZ = !BOOL[D.vr.isZ];
            tryRefreshEditPreview();
            event.preventDefault();
        } else if ((event.keyCode === 13) && currentAction) {//Enter
           
            confirmEditPreview();
            event.preventDefault();
        }
    };

    
    return {
        //called from outside the 2d UI only:
        terminateCurrentAction: terminateCurrentAction
    };
}());