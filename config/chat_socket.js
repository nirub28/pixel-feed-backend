module.exports.chatSockets = function (socketServer) {
  let io = require("socket.io")(socketServer, {
    cors: {
      origin: "http://localhost:3000", // Replace with your frontend URL
      methods: ["GET", "POST"],
      credentials: false,
    },
  });

  io.sockets.on("connection", function (socket) {
    // console.log('new connection received...!');


    socket.on('join_room', function(data){
        // console.log('Joining request received..', data);
        socket.join(data); // Join the room (conversation)
    });

    socket.on('newMessage', function (messageData) {
        // Handle the new message, e.g., save it to the database
        // Broadcast the message to all clients in the room
        io.in(messageData.room).emit('newMessage', messageData);
      });
      

    socket.on("disconnect", function () {
      // console.log('socket disconnected..!');
    });
  });
};
