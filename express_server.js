const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function(str){
    return Math.random().toString(20).slice(2, str);
}

const getUserByEmail = function(email, usersDB) {
  for (const user in usersDB){
    if(users[user].email === email) {
      return usersDB[user]
    }
  }
  return undefined;
}


app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening at port ${PORT}`);

});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    const templateVars = {
        user: req.cookies["emailID"],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req,res) => {
    const templateVars = {
      user: req.cookies["emailID"],
      
  };
    res.render("urls_new", templateVars);
  })

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req,res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(8);
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");  
  });

  app.post("/urls/:id/delete", (req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  })

  app.get("/urls/:id/edit", (req,res) => {
    const templateVars = { 
      id: req.params.id, 
      longURL: urlDatabase[req.params.id],
      user: req.cookies["emailID"]
     };
    const longURL = urlDatabase.id;
    res.render("urls_show", templateVars);
    
  })

  app.post("/urls/:id/edit", (req,res) => {
    
    res.redirect("/urls");
  })

  app.get("/login", (req,res) => {
    const templateVars = {
      user: req.cookies["emailID"]
    };
    res.render("urls_login", templateVars);
  })

   app.post("/login", (req, res) => {
    const emailID = getUserByEmail(req.body.email, users);
    const pswdID = req.body.password;
    if ( emailID == undefined ){
      console.log("undefined");
    
    }else if(emailID.password === pswdID){
      res.cookie("user", emailID)
    } 
    //console.log(emailID, pswdID);emailID.password
   res.redirect("urls");
   })

  //go to registration page
  app.get("/register", (req,res) => {
    const templateVars = {
      user: req.cookies["emailID"]
    };
    res.render("urls_register", templateVars);
  });
  
  //users registration
  app.post("/register", (req,res) => {
    const user = req.body.email;
    const pswd = req.body.password;
    const userID = generateRandomString(12);
    users[userID] = {
      id: userID,
      email: user,
      password: pswd
    }
    // const templateVars = {
    //   username: req.cookies[userID]
    // };
    res.cookie("user", userID)
    console.log(users);
    //users[user] = pswd;
    res.redirect("urls")
  })

  app.post("/logout", (req,res) => {
    res.clearCookie("user", {path: '/'});
    res.redirect("urls");
  })
  