const { uuid } = require("uuidv4");

const users = {};

const validateUsernameSintax = (username) => {
  if (
    !username ||
    username.match(/[\W]+/) ||
    !username.match(/[\w]{2,20}/) ||
    username === "dog"
  ) {
    return false;
  }
  return true;
};

const validateSession = (sid) => {
  console.log(users);
  console.log(sid);
  if (!sid) {
    return false;
  }
  if (Object.keys(users).includes(sid)) {
    return true;
  }

  return false;
};

const authorizeSessionId = (sid, username) => {
  if (users[sid].username === username) {
    return true;
  }
  return false;
};

const createSession = (username) => {
  const id = uuid();
  users[id] = { id, username };
  return users[id];
};

const removeSession = (sid) => {
  delete users[sid];
};

module.exports = {
  validateUsernameSintax,
  createSession,
  validateSession,
  authorizeSessionId,
  removeSession,
};
