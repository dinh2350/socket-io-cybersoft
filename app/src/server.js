const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const FilterBadWords = require("bad-words");
const { addUser, getListUserByRoom, getUserById, removeUser } = require("./model/user");
const { generateMessages } = require("./utils/generate-messages");
const app = express();
const pathPublicDirectory = path.join(__dirname, "../public");
app.use(express.static(pathPublicDirectory));
const server = http.createServer(app);
// tạo io để giao tiếp với client
const io = socketio(server);
// kết nối server với client
io.on("connection", (socket) => {
  console.log("new client connect", socket.id);

  // xử lý room
  socket.on("join-room-client-to-server", ({ room, username }) => {
    socket.join(room); // đưa client vào phòng

    // xử lý thêm user vào danh sách user
    addUser({
      id: socket.id,
      room,
      username,
    });

    // xử lý send user list về front end
    io.to(room).emit("send-user-list-server-to-client", getListUserByRoom(room));

    // xử lý câu chào
    // xử lý câu chào cho client vừa kết nối
    socket.emit("send-messages-server-to-client", generateMessages("ADMIN", "Chào Mừng đến với CyberChat"));
    // xử lý cầu chào cho các client còn lại
    socket.broadcast
      .to(room)
      .emit("send-messages-server-to-client", generateMessages("ADMIN", "Có một user mới vừa tham gia group chat"));

    // nhận message từ client
    socket.on("send-messages-client-to-server", (message, callback) => {
      // kiểm tra xem message có hợp lệ hong
      const filterBadWords = new FilterBadWords();
      if (filterBadWords.isProfane(message)) {
        return callback("message có từ khóa không tốt");
      }
      //  tìm user đang chat
      const { username } = getUserById(socket.id);
      // gửi messages về cho các client trong kết nối
      io.to(room).emit("send-messages-server-to-client", generateMessages(username, message));
      // đã gửi thành công
      callback();
      // lưu vào mysql
    });
  });

  // ngắt kết nối
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`client ${socket.id} disconnect `);
  });
});
const port = 5000;
server.listen(port, () => {
  console.log(`app run on http://localhost:${port}/`);
});
