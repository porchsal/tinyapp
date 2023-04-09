const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"

// };

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
    longURL: "htt[://www.cloud.com",
    userID: "s9m5xK"
  }
};


const users = {
  b2xVn2: {
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
   s9m5xK: {
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = function(str){
    return Math.random().toString(20).slice(2, str);
}

const getUserByEmail = function(email, usersDB) {
  for (const user in usersDB){
    if(usersDB[user].email === email) {
      return usersDB[user]
    }
  }
  return undefined;
}
const getUserIDByEmail = function(email, usersDB) {
  for (const user in usersDB){
    if(usersDB[user].email === email) {
      return user;
    }
  }
  return undefined;
}
const urlForUser = function(id) {
  let userUrls = {};
  //const userID = getUserIDByEmail(id, users);
  for(const shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === id){
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
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
    if(req.cookies["user_id"]){
      const userID = getUserIDByEmail(req.cookies["user_id"], users);
      const userUrl = urlForUser(userID)
      
      
      const templateVars = {
      user_id: req.cookies["user_id"],
      urls: userUrl
      };
      console.log(userID);
      res.render("urls_index", templateVars);
    } else {
      //res.status(403).send("You mus be logged in ");
      res.redirect("/login");
      return;
      }
      
  });

  
//new url page get
  app.get("/urls/new", (req,res) => {
    if(req.cookies["user_id"]){
      const templateVars = {
      user_id: req.cookies["user_id"],
      };
      res.render("urls_new", templateVars);
    } else {
      //res.status(403).send("You mus be logged in ");
      res.redirect("/login");
      return;
      }

  })

// create new tinyurl
  app.post("/urls", (req,res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(8);
    const userID = generateRandomString(8);
    urlDatabase[shortURL] = {longURL, userID};
    res.redirect("/urls");
      
  });
  
  
  app.get("/urls/:id", (req, res) => {
    const templateVars = { 
      id: req.params.id, 
      longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
  });

  

  app.post("/urls/:id/delete", (req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  })


  // edit url get
  app.get("/urls/:id/edit", (req,res) => {
    if( urlDatabase[req.params.id]){
      const templateVars = { 
            id: req.params.id, 
            longURL: urlDatabase[req.params.id].longURL,
            userID: urlDatabase[req.params.id].userID,
            user_id: req.cookies["user_id"]
          };
          console.log(req.params.id);
      res.render("urls_show", templateVars);
    } else {
      res.status(403).send("ShortUrl not in Database")
    }
    
    
    
    
    
  })
//edit url post
  app.post("/urls/:id/edit", (req,res) => {
    //const temp = req.params.id;
    //urlDatabase[temp] = {
      const longURL = req.body.newURL;
      
    //}
    
    //const longURL = req.body.newURL;
    console.log(longURL);
    //urlDatabase[req.body.longURL].longURL
    res.redirect("/urls");
  })
//login page get
  app.get("/login", (req,res) => {
    //check if user is logged then send to urls
    if(req.cookies["user_id"]){
      res.redirect("urls");
      return;
    }
    
    
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
      
    } 
    

    res.redirect('/urls');
   })

  //registration page get
  app.get("/register", (req,res) => {
    //check if user is logged then send to urls
    if(req.cookies["user_id"]){
      res.redirect("urls");
      return;
    };
    
    
    
    const templateVars = {
      user_id: req.cookies["user_id"]
    };
    res.render("urls_register", templateVars);
  });
  
  //registration page post
  app.post("/register", (req,res) => {
    const useremail = req.body.email;
    const pswd = req.body.password;
    const userID = generateRandomString(12);
   
    if( req.body.email && req.body.password ) {

  //check if the user is in users database
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
  