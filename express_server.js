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

const generateRandomString = function(){
    return Math.random().toString(20).slice(2, 8);
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
        username: req.cookies["username"],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req,res) => {
    const templateVars = {
      username: req.cookies["username"],
      
  };
    res.render("urls_new", templateVars);
  })

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req,res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
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
      username: req.cookies["username"]
     };
    const longURL = urlDatabase.id;
    res.render("urls_show", templateVars);
    
  })

  app.post("/urls/:id/edit", (req,res) => {
    
    res.redirect("/urls");
  })

  app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookies("username", username);
    res.redirect("urls")
  })
  