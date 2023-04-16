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
    res.redirect("urls");
    return;
  }
  const templateVars = {
    user_id: req.session.user_id
  };
  res.render("urls_login", templateVars);
});

//list of urls get
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const userID = getUserIDByEmail(req.session.user_id, users);
    const userUrl = urlForUser(userID, urlDatabase);
    const templateVars = {
      user_id: req.session.user_id,
      urls: userUrl
    };
    res.render("urls_index", templateVars);
  } else {
    const errorMessage = "You must be logged in to check Urls";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  }
});

//new url page get
app.get("/urls/new", (req,res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: req.session.user_id,
    };
    res.render("urls_new", templateVars);
  } else {
    // const errorMessage = "You must be logged in to create new Short Url";
    // res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
    const templateVars = {
      user_id: req.session.user_id
    };
    res.render("urls_login", templateVars);
  }
});

// create new tinyurl
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(8);
  const userID = getUserIDByEmail(req.session.user_id, users);
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect("/urls");
});
  
// delete url from user logged
app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//edit url get
app.get("/urls/:id", (req,res) => {
  const shortUrl = req.params.id;
  const owner = getUserIDByEmail(req.session.user_id, users);
  if (urlDatabase[shortUrl].userID === owner && urlDatabase[req.params.id].userID) {
    const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: urlDatabase[req.params.id].userID,
    user_id: req.session.user_id
    };
    res.render("urls_show", templateVars);
  } else {
    const errorMessage = "Url not in logged user database";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  }
});

//edit url post
app.post("/urls/:id", (req,res) => {
  const shortUrl = req.params.id;
  const owner = getUserIDByEmail(req.session.user_id, users);
  if (urlDatabase[shortUrl].userID === owner && urlDatabase[req.params.id].userID) {
    urlDatabase[shortUrl].longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    const errorMessage = "Url doesn't belong to user, can't update";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  }
});

//redirect to the longUrl site
app.get("/u/:id", (req,res) => {
  const shortUrl = req.params.id;
  if(urlDatabase[shortUrl]){
    res.redirect(urlDatabase[shortUrl].longURL);
  }else {
    const errorMessage = "This shortUrl does not exists";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  }
});

//login page get
app.get("/login", (req,res) => {
  //check if user is logged then send to urls
  if (req.session.user_id) {
    res.redirect("urls");
    return;
  }
  const templateVars = {
    user_id: req.session.user_id
  };
  res.render("urls_login", templateVars);
});

//login page post
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const pswdID = req.body.password;
  if (!user) {
    const errorMessage = "Email not found";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  } else if (!bcrypt.compareSync(pswdID, user.password)) {
    const errorMessage = 'Password incorrect.';
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
    return;
      
  } else {
    req.session.user_id = user.email;
  }
  res.redirect('/urls');
});

//registration page get
app.get("/register", (req,res) => {
  //check if user is logged then send to urls
  if (req.session.user_id) {
    res.redirect("urls");
    return;
  }
  const templateVars = {
    user_id: req.session.user_id
  };
  res.render("urls_register", templateVars);
});
  
//registration page post
app.post("/register", (req,res) => {
  const useremail = req.body.email;
  const pswd = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email && req.body.password) {

    //check if the user is in users database
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString(12);
      users[userID] = {
        id: userID,
        email: useremail,
        password: pswd
      };
      req.session.user_id = users[userID].email;
      res.redirect("/urls");
    } else {
      const errorMessage = "Email already used";
      res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
    }
  } else {
    const errorMessage = "Empty user name or password";
    res.status(403).render('urls_error', {user_id: users[req.session.userID], errorMessage});
  }

});
//logout and clear cookie
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}`);

});