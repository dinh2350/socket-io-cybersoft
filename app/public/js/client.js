const socket = io();

const acknowledlgements = (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("đã gửi tin nhắn");
  }
};

document.getElementById("form-messages").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("input-messages").value;
  // gửi event lên server ( tên event : send-messages-client-to-server )
  socket.emit("send-messages-client-to-server", message, acknowledlgements);
});

// nhận message từ server
socket.on("send-messages-server-to-client", ({ message, username, time }) => {
  // hiển thị ra màn hình
  document.getElementById("app__messages").innerHTML += `
    <div class="message-item">
      <div class="message__row1">
        <p class="message__name">${username}</p>
        <p class="message__date">${time}</p>
      </div>
      <div class="message__row2">
        <p class="message__content">${message}</p>
      </div>
    </div>
  `;
});

// xử lý query string
const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("join-room-client-to-server", { room, username });

// nhận userlist theo phòng
socket.on("send-user-list-server-to-client", (userList) => {
  // console.log(userList);
  // let contentHtml = ``;
  // userList.map((user) => {
  //   contentHtml += `
  //     <li class="app__item-user">${user.username}</li>
  //   `;
  // });

  // document.getElementById("chatapp-userlist").innerHTML = contentHtml;

  // c2

  document.getElementById("chatapp-userlist").innerHTML = userList
    .map(
      (user) => `
      <li class="app__item-user">${user.username}</li>
    `
    )
    .reduce((tongChuoi, item) => (tongChuoi += item), "");
});
