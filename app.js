const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs=require('fs');
const path=require('path')

const URI =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.grwrf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const userRoute = require("./routes/users-routes");
const postRoute = require("./routes/post-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
app.use('/upload/images',express.static(path.join('upload','images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});


app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);

app.use((req, res, next) => {
  const error = new HttpError("could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,(err)=>{
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error has occrued please try again",
  });
});

mongoose
.connect(URI)
.then((result) => app.listen(5000))
  .catch((error) => {
    console.log("could not connect ot the database");
  });
