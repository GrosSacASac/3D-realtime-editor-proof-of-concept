/* io, view3d, view2d

role communication with outside, uses socket-io
*/
var bridge = (function () {
    "use strict";
    var socket,
            
        startLinkWithServer = function () {
            socket = io();
            socket.on("setCameraInfo", view3d.setCameraInfo);
            socket.on("addBox", view3d.addBox);
            socket.on("addSphere", view3d.addSphere);
            socket.on("deleteAll", view3d.deleteAll);
            socket.on("edit", view3d.edit);
            //socket.on("update", viewAndControls.updateUiState);
        },
        
        updateServerState = function (what, data) {
            socket.emit(what, data);
        };
        

        
    return {
        startLinkWithServer: startLinkWithServer,
        updateServerState: updateServerState
    };
}());
 