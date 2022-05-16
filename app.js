//requiring modules
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const express = require("express");
//creating a new app instance using the express module
const app = express();

//setting our view engine to use ejs as our templating engine
app.set("view engine", "ejs");
//telling express to use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
//assigning a directory for static files
app.use(express.static("public"));
//allowing mongoose to connect to our local mongoDB instance
mongoose.connect("mongodb://127.0.0.1:27017/wikiDB");
//creating a Schema for our Article collection
const articleSchema = {
  title: String,
  content: String
};
//creating a new collection by creating a new model
const Article = mongoose.model("Article", articleSchema);
//creating a chainable route handler
app.route("/articles")
  //fetching the articles //how should the server respond if the client makes a GET request on our articles route
  //finding all documents in the Article collection
  .get(function(req, res) {
    Article.find({}, function(err, foundArticles) {
      if (!err) {
        //send results back to client
        res.send(foundArticles)
      } else {
        //sending back possible errors
        res.send(err);
      }
    })
  })
  //what happens if the client makes a POST request to our articles route
  //client is sending data to our Server
  .post(function(req, res) {
    //tapping into the body from the POST request
    console.log(req.body.title);
    console.log(req.body.content);
    //creating data in mongoDB using mongoose and assigning the data from the POST request
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    //saving the data to our database and sending data back to the client
    newArticle.save(function(err) {
      if (!err) {
        res.send("Succesfully added a new article.");
      } else {
        //sending back possible errors
        res.send(err)
      }
    });
  })
  //client is sending a delete request to a specific route to delete all of the articleSchema
  .delete(function(req, res) {
    //response from the Server
    //deleting multiple documents from a collection
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Succesfully deleted all articles.")
      } else {
        res.send(err)
      }
    });
  });
//creating a chainable route handler for a specific document with a route parameter
app.route("/articles/:articleTitle")
  .get(function(req, res) {
    //searching the database for a specific document that matches a parameter
    Article.findOne({
      //matching the title condition to the client requested article
      title: req.params.articleTitle
    }, function(err, foundArticle) {
      if (foundArticle) {
        //sending the article back to the client if it exists in the database
        res.send(foundArticle)
      } else {
        //sending a message to the client if there were no matches
        res.send("No matching articles found!")
      }
    })

  })
  //updating a particular document by the client
  .put(function(req, res) {
    Article.findOneAndUpdate({
        //the condition on which document the client wants to perform the update
        title: req.params.articleTitle
      }, {
        //the actual update the client wants to perform
        title: req.body.title,
        content: req.body.content
      }, {
        //setting the overwrite argument to true
        overwrite: true
      },

      function(err, results) {
        if (!err) {
          res.send("Succefully updated the article!")
        }
      })
  })
  //updating a document but only with the field provided by the client
  .patch(function(req, res) {
    Article.findOneAndUpdate({
      //condition for which document the client wants to update
      title: req.params.articleTitle
    }, {
      //providing the body object and body parser will pick out the fields provided by the client
      $set: req.body
    }, function(err, results) {
      if (!err) {
        res.send("Succesfully updated the article.")
      } else {
        res.send(err)
      }
    })
  })
  //handling a delete request for a specific article from the client
  .delete(function(req, res) {
    Article.deleteOne({
      //condition requested by the client in the url
      title: req.params.articleTitle
    }, function(err) {
      if (!err) {
        res.send("Succesfully deleted article!")
      } else {
        res.send(err)
      }
    })
  });

//telling the server to listen for a connection
app.listen(3000, function() {
  console.log("Server has started on port 3000")
})
