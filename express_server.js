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
//list of urls get
  app.get("/urls", (req, res) => {
    const templateVars = {
        user_id: req.cookies["user_id"],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });
//new url page get
  app.get("/urls/new", (req,res) => {
    const templateVars = {
      user_id: req.cookies["user_id"],
      
  };
    res.render("urls_new", templateVars);
  })

// create new tinyurl
  app.post("/urls", (req,res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(8);
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");  
  });
  
  
  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

  

  app.post("/urls/:id/delete", (req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  })
// edit url get
  app.get("/urls/:id/edit", (req,res) => {
    const templateVars = { 
      id: req.params.id, 
      longURL: urlDatabase[req.params.id],
      user_id: req.cookies["user_id"]
     };
    const longURL = urlDatabase.id;
    res.render("urls_show", templateVars);
    
  })
// edit url post
  app.post("/urls/:id/edit", (req,res) => {
    
    res.redirect("/urls");
  })
//login page get
  app.get("/login", (req,res) => {
    const templateVars = {
      user_id: req.cookies["user_id"]
    };
    res.render("urls_login", templateVars);
  })
//login page post
   app.post("/login", (req, res) => {
    const user = getUserByEmail(req.body.email, users);
    const pswdID = req.body.password;
    
    
    if ( !user ){
      res.status(403).send("Email not found");
      return;
    }else if(user.password !== pswdID){
      res.status(403).send("Password incorrect");
      return;
      
    }else {
      res.cookie("user_id", user.email);
      //console.log(user);
    } 
    

    res.redirect('/urls');
   })

  //registration page get
  app.get("/register", (req,res) => {
    const templateVars = {
      user_id: req.cookies["user_id"]
    };
    res.render("urls_register", templateVars);
  });
  
  ////registration page post
  app.post("/register", (req,res) => {
    const useremail = req.body.email;
    const pswd = req.body.password;
    const userID = generateRandomString(12);
   
    const templateVars = {
      user: req.cookies["user_id"],
      id: userID,
      email: useremail,
      password: pswd,
      
    };
    if( req.body.email && req.body.password ) {
      if(!getUserByEmail(req.body.email, users)){
        const userID = generateRandomString(12);
        users[userID] = {
          id: userID,
          email: useremail,
          password: pswd
        };
      
        res.redirect('/urls');
      } else {
        res.status(400).send("Email already used");
      }
    } else {
      res.status(400).send("Empty user name or password");
    }


  });
//logout and clear cookie
  app.post("/logout", (req,res) => {
    res.clearCookie("user_id", {path: '/'});
    res.redirect("urls");
  })
  