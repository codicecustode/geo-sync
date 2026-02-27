const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join_session", ({ roomId, role }) => {

      console.log("JOIN REQUEST:", {
        socketId: socket.id,
        roomId,
        role
      });

      if (role === "tracker") {
        const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set();
        const hasExistingTracker = [...roomSockets].some((id) => {
          const existingSocket = io.sockets.sockets.get(id);
          return existingSocket?.data?.role === "tracker";
        });

        if (hasExistingTracker) {
          console.log("JOIN REJECTED: tracker already exists", {
            socketId: socket.id,
            roomId,
          });
          socket.emit("tracker_taken", {
            message: "Tracker already exists in this room",
            roomId,
          });
          return;
        }
      }

      socket.join(roomId);

      socket.data.role = role;
      socket.data.roomId = roomId;

      socket.emit("join_accepted", { roomId, role });

      console.log("JOINED ROOM:", {
        socketId: socket.id,
        room: roomId,
        role
      });

      // show all rooms this socket joined
      console.log("Socket rooms:", [...socket.rooms]);

      io.to(roomId).emit("connection_status", "Connected");
    });

    socket.on("map_move", (data) => {

      console.log("MAP MOVE RECEIVED:", {
        from: socket.id,
        role: socket.data.role,
        room: socket.data.roomId,
        data
      });

      if (socket.data.role !== "tracker") {
        console.log("Ignored: Non-tracker tried to move map");
        return;
      }

      console.log("📡 Broadcasting sync_map to room:", socket.data.roomId);

      socket
        .to(socket.data.roomId)
        .emit("sync_map", data);
    });

    socket.on("disconnect", (reason) => {

      const { roomId, role } = socket.data || {};

      console.log("User disconnected:", {
        socketId: socket.id,
        role,
        roomId,
        reason
      });

      if (role === "tracker" && roomId) {
        console.log("Tracker left — notifying viewers");

        io.to(roomId).emit("tracker_disconnected");
      }
    });

    socket.on("error", (err) => {
      console.log("Socket error:", err);
    });

  });
};

export default socketHandler;