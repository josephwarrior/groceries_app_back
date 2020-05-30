const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
const { getItems, addItem, updateItems, deleteItem } = require("./itemsdb");
const {
  validateUsernameSintax,
  createSession,
  removeSession,
  validateSession,
  authorizeSessionId,
} = require("./sessionsdb");

const app = express();
app.use(express.json());
app.use(express.static("./build"));
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "", data: "" });
});

const checkClientInfo = (req, res) => {
  const { sid } = req.body;
  const username = req.params.username;

  if (!username) {
    res.status(401).json({ message: "USERNAME_REQUIRED" });
    return false;
  }

  const isValidUsernameSintax = validateUsernameSintax(username);
  if (!isValidUsernameSintax) {
    res.status(401).json({ message: "USERNAME_SINTAX_INVALID" });
    return;
  }
  const isValidSession = validateSession(sid);

  if (!isValidSession) {
    res.status(401).json({ message: "LOGIN_REQUIRED" });
    return false;
  }

  const isAuthorizedId = authorizeSessionId(sid, username);
  if (!isAuthorizedId) {
    res.status(403).json({ message: "LOGIN_UNAUTHORIZED" });
    return false;
  }

  return true;
};

const checkItemsObjectInfo = (req, res) => {
  const itemObject = Object.values(req.body)[1];

  const itemsObject = Object.keys(itemObject).includes("category")
    ? { itemObject }
    : itemObject;
  const itemsArray = Object.values(itemsObject);
  for (let index in itemsArray) {
    let item = itemsArray[index];
    item.category = item.category.trim();
    item.name = item.name.trim();
    if (item.category === "" || item.name === "") {
      res.status(400).json({ message: "ITEMINFO_INCOMPLETE" });
      return false;
    }
  }
  return true;
};

app.post("/session/:username", (req, res) => {
  const username = req.params.username;

  const isValidUsernameSintax = validateUsernameSintax(username);
  if (!isValidUsernameSintax) {
    res.status(401).json({ message: "USERNAME_SINTAX_INVALID" });
    return;
  }
  const user = createSession(username);

  res
    .status(200)
    .json({ message: "", data: { sid: user.id, username: user.username } });
});

app.delete("/session/:username", (req, res) => {
  const isClientInfoValid = checkClientInfo(req, res);
  if (!isClientInfoValid) {
    return;
  }

  sid = req.body.sid;
  removeSession(sid);
  res.status(200).json({ sid: sid, message: "logout successful" });
});

app.post("/itemss/:username", (req, res) => {
  const isClientInfoValid = checkClientInfo(req, res);
  if (!isClientInfoValid) {
    return;
  }
  const username = req.params.username;
  res.status(200).json({ data: getItems(username) });
});

app.post("/items/:username", (req, res) => {
  const isClientInfoValid = checkClientInfo(req, res);
  if (!isClientInfoValid) {
    return;
  }
  const isItemInfoComplete = checkItemsObjectInfo(req, res);
  if (!isItemInfoComplete) {
    return;
  }
  const { newItem } = req.body;
  const username = req.params.username;
  addItem(newItem, username);
  res.status(200).json({ message: "", data: getItems(username) });
});

app.put("/items/:username", (req, res) => {
  const isClientInfoValid = checkClientInfo(req, res);
  if (!isClientInfoValid) {
    return;
  }
  const isItemInfoComplete = checkItemsObjectInfo(req, res);
  if (!isItemInfoComplete) {
    return;
  }
  const { updatedItemsObject } = req.body;
  const username = req.params.username;
  updateItems(updatedItemsObject, username);
  res.status(200).json({ message: "", data: getItems(username) });
});

app.delete("/items/:username/:itemid", (req, res) => {
  const isClientInfoValid = checkClientInfo(req, res);
  if (!isClientInfoValid) {
    return;
  }
  const itemId = req.params.itemid;
  if (!itemId) {
    res.status(400).json({ message: "iteminfo incomplete" });
    return;
  }

  const username = req.params.username;

  deleteItem(itemId, username);
  res.status(200).json({ message: "", data: getItems(username) });
});

app.listen(PORT, () => {
  console.log("listening on http://localhost:" + PORT);
});
