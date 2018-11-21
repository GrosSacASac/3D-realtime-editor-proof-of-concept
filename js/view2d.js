/*d, bridge, screen, Date*/
var view2d = (function () {
    "use strict";
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
    d.functions.showCommands = function (event) {
        d.elements.commands.classList.toggle("inactive");
    };
    
    d.functions.switchCamera = function (event) {
        
        d.elements.editing.classList.toggle("hidden");
        enterFullScreen();
        view3d.switchCamera();
    };
    
    d.functions.addBox = function (event) {
        d.feed("name", String(Date.now()));
        d.feed("lastAction", "Box added !");
        view3d.addBox(d.variables);
        bridge.updateServerState("addBox", d.variables);
    };    
    
    d.functions.addSphere = function (event) {
        d.feed("name", String(Date.now()));
        d.feed("lastAction", "Sphere added !");
        view3d.addSphere(d.variables);
        bridge.updateServerState("addSphere", d.variables);
    };
    
    d.functions.deleteAll = function (event) {
        view3d.deleteAll(d.variables);
        bridge.updateServerState("deleteAll", {});
        d.feed("lastAction", "deleteAll !");
    };
    
    var getDataMeasures = function() {
        return {
            what: keyToAction[currentAction],
            x: d.variables.isX ? parseFloat(d.variables.howMuch): 0,
            y: d.variables.isY ? parseFloat(d.variables.howMuch): 0,
            z: d.variables.isZ ? parseFloat(d.variables.howMuch): 0
        }
    };
    
    var tryRefreshEditPreview = function() {
        if ((currentAction in keyToAction) && !isNaN(parseFloat(d.variables.howMuch))){
            
            view3d.editPreview(getDataMeasures());
        }
    };
    
    d.functions.useInput = function (event) {
        usingMouse = false; // using input instead
        tryRefreshEditPreview();
    };
    
    d.functions.useMouseMouvementAsInput = function (event) {
        screenX = event.screenX;
        //screenY = event.screenY;
        if ((currentAction in keyToAction) && usingMouse) {
            d.feed("howMuch", (screenX * 8 / screen.width) - 4); 
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
        d.feed("helpMessage", "");
    }
    
    d.functions.tryShortCut = function (event) {
        var pressedKey = String.fromCharCode(event.keyCode);
        
        var startNewEditPreview = function(message) {
            if (!view3d.getSelection().name) {
                d.feed("helpMessage", "Nothing is selected");
                return;
            }
            view3d.editPreviewCancel();
            currentAction = pressedKey;
            captureCurrentMousePosition();
            d.variables.helpMessage = message;
        };
        
        var confirmEditPreview = function() {
            if (isNaN(parseFloat(d.variables.howMuch))) {
                d.feed("helpMessage", d.variables.helpMessage + "Value is invalid");
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
            d.feed("isX", !d.variables.isX);
            tryRefreshEditPreview();
            event.preventDefault();
        } else if (pressedKey === "Y") {
            d.feed("isY", !d.variables.isY);
            tryRefreshEditPreview();
            event.preventDefault();
        } else if (pressedKey === "Z") {
            d.feed("isZ", !d.variables.isZ);
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