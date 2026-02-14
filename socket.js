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
        console.log(user);
      } catch (error) {
        console.log(error);
      }
    });
    //  disconnect to user offline
    socket.on("disconnect", async () => {
      try {
        await User.findByIdAndUpdate(
          { socketId: socket.id },
          { socketId: null, isOnline: false },
        );
      } catch (error) {
        console.log(error);
      }
    });
  });
};
