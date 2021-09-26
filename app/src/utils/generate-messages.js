const dateFormat = require("date-format");
const generateMessages = (username, message) => ({
  message,
  username,
  time: dateFormat("dd/MM/yyyy - hh:mm", new Date()),
});

module.exports = {
  generateMessages,
};
