var express = require("express");
var router = express.Router();
let request = require('request');
const { User } = require("../db/models/User");
const db = require("../db/MongoUtils");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/poblate", (req, res) => {
  const api = "https://my.api.mockaroo.com/spyfall_users.json?key=4c64b470";
  request(api, async (err, response, body) => {
    if(!err && res.statusCode == 200){
      body = body.substring(24);
      const arr = body.split(",");
      let email=arr[0],name,avatar,score,temp;
      for(let i = 1; i < 420; i++){
            switch(i%3){
                case 2:
                    avatar = arr[i];
                    break;
                case 1:
                    name = arr[i];
                    break;
                case 0:
                    temp = arr[i].split("\n");
                    score = temp[0];
                    try{
                        await db.createOneDocumentPromise(
                            "dbName", 
                            "usersCollection",
                            new User(email,name,avatar,score)
                        ).then((docs) => console.log(docs));
                    }catch (err) {
                        console.log(err);
                    }
                    
                    email = temp[1];
                    break;
            }
      }
      res.send(body);  
    }
  });
})

module.exports = router;
