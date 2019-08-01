var socketIO = require("socket.io");

module.exports = server => {
    const io = socketIO(server);

    io.on("connection", socket => {
        /*setInterval(() => {}, 1000 * 3); */
        socket.emit("pushNotification", {
            success: true,
            msg: "hello" + Date.now()
        });
    });
    return server;
};