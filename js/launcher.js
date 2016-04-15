/*dom99, bridge, view3d, view2d*/
(function () {
    "use strict";
    var D = dom99;

    // initial data-vr values
    D.vr = {
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
    D.linkJsAndDom();
    view3d.start();
    bridge.startLinkWithServer();
}());