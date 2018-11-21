/*d, bridge, view3d, view2d*/
(function () {
    "use strict";

    // initial data-vr values
    var initialVariables = {
        "position": {
            "x": 0,
            "y": 2,
            "z": 0,
        },
        "rotation": {
            "x": 0,
            "y": 0,
            "z": 0,
        },
        "scaling": {
            "x": 1,
            "y": 1,
            "z": 1,
        },
        howMuch: 1.5,
        isX: true,
        isY: false,
        isZ: false
    };
    d.start(document.body, initialVariables);
    view3d.start();
    bridge.startLinkWithServer();
}());