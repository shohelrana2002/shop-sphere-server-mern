import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identity", async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true },
        );
        console.log("User Online:", user?.socketId);
      } catch (error) {
        console.log("Identity Error:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: null, isOnline: false },
        );
        console.log("User Disconnected:", socket.id);
      } catch (error) {
        console.log("Disconnect Error:", error);
      }
    });
  });
};
