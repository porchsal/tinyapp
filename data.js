const bcrypt = require("bcryptjs");

const urlDatabase = {
    b6UTxQ: {
      longURL: "http://www.lighthouselabs.ca",
      userID: "b2xVn2",
    },
    i3BoGr: {
      longURL: "http://www.google.com",
      userID: "s9m5xK",
    },
    a1b2c3:{
      longURL: "http://www.cloud.com",
      userID: "s9m5xK"
    }
  };
  
const users = {
    b2xVn2: {
      email: "user@example.com",
      password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    },
    s9m5xK: {
      email: "user2@example.com",
      password: bcrypt.hashSync("dishwasher-funk",10)
    }
  };

  module.exports = {urlDatabase, users};
