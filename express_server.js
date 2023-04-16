const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlForUser, getUserIDByEmail } = require('./helpers');
const {urlDatabase, users} = require('./data');
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
  })
);

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//list of urls get
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const errorMessage = "You must be logged in to check Urls";
    res.status(403).render('urls_error', {user: users[userID], errorMessage});
  }

  const templateVars = {
    user: users[userID],
    urls: urlForUser(userID, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

//new url page get
app.get("/urls/new", (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

// create new tinyurl
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(8);
  const userID = req.session.user_id;
  if (!userID) {
    const errorMessage = "You must be logged in to create a url";
    return res.status(403).render('urls_error', {user_id: users[userID], errorMessage});
  }
  
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});
  
// delete url from user logged
app.post("/urls/:id/delete", (req,res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  if (!userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "You are not logged in"});
  }

  if (!urlDatabase[shortUrl]) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This url does not exist"});
  }

  if (urlDatabase[shortUrl].userID !== userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This does not belong to you"});
  }
  
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

//edit url get
app.get("/urls/:id", (req,res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  if (!userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "You are not logged in"});
  }

  if (!urlDatabase[shortUrl]) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This url does not exist"});
  }

  if (urlDatabase[shortUrl].userID !== userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This does not belong to you"});
  }
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[shortUrl].longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

//edit url post
app.post("/urls/:id", (req,res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  if (!userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "You are not logged in"});
  }

  if (!urlDatabase[shortUrl]) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This url does not exist"});
  }

  if (urlDatabase[shortUrl].userID !== userID) {
    return  res.status(403).render('urls_error', {user: users[userID], errorMessage: "This does not belong to you"});
  }

  urlDatabase[shortUrl].longURL = req.body.newURL;
  res.redirect("/urls");
});

//redirect to the longUrl site
app.get("/u/:id", (req,res) => {
  const shortUrl = req.params.id;
  if (urlDatabase[shortUrl]) {
    res.redirect(urlDatabase[shortUrl].longURL);
  } else {
    const errorMessage = "This shortUrl does not exists";
    res.status(403).render('urls_error', {user: undefined, errorMessage});
  }
});

//login page get
app.get("/login", (req,res) => {
  const userID = req.session.user_id;
  //check if user is logged then send to urls
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_login", templateVars);
});

//login page post
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    const errorMessage = "Empty user name or password";
    return res.status(403).render('urls_error', {user: undefined, errorMessage});
  }

  const user = getUserByEmail(req.body.email, users);
  const userID = req.session.user_id;
  const pswdID = req.body.password;
  const userSession = getUserIDByEmail(req.body.email, users);
  if (!user) {
    const errorMessage = "Email not found";
    return res.status(403).render('urls_error', {user: users[userID], errorMessage});
  }
  if (!bcrypt.compareSync(pswdID, user.password)) {
    const errorMessage = 'Password incorrect.';
    return res.status(403).render('urls_error', {user: users[userID], errorMessage});
  }
  
  req.session.user_id = userSession;
  res.redirect('/urls');
  
});

//registration page get
app.get("/register", (req,res) => {
  //check if user is logged then send to urls
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_register", templateVars);
});
  
//registration page post
app.post("/register", (req,res) => {
  const useremail = req.body.email;
  
  if (!req.body.email || !req.body.password) {
    const errorMessage = "Empty user name or password";
    return res.status(403).render('urls_error', {user: undefined, errorMessage});
  }
  
  if (getUserByEmail(req.body.email, users)) {
    const errorMessage = "Email already used";
    return res.status(403).render('urls_error', {user: undefined, errorMessage});
  }

  const pswd = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString(8);
  users[userID] = {
    email: useremail,
    password: pswd
  };
  req.session.user_id = userID;
  res.redirect("/urls");
  
});

//logout and clear cookie
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}`);
});