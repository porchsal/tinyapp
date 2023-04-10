const generateRandomString = function(str){
    return Math.random().toString(20).slice(2, str);
}

const getUserByEmail = function(email, usersDB) {
  for (const user in usersDB){
    if(usersDB[user].email === email) {
      return usersDB[user];
    }
  }
  return undefined;
}

const urlForUser = function(id, database) {
    let userUrls = {};
    //const userID = getUserIDByEmail(id, users);
    for(const shortURL in database){
      if(database[shortURL].userID === id){
        userUrls[shortURL] = database[shortURL];
      }
    }
    return userUrls;
  }
module.exports = {generateRandomString, getUserByEmail, urlForUser};