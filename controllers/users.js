const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const Users = require("../models/user");
const bycrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await Users.find({},'-password');
  } catch (error) {
    return next(new HttpError("Fetching users failed", 422));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.postSignUp = async (req, res, next) => {
  const { email, name, password } = req.body;
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    const error = new HttpError("Error in input data, please check it", 422);
    return next(error);
  }
  let emailExist;
  try {
    emailExist = await Users.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("failed to signup", 422));
  }
  if (emailExist) {
    console.log(emailExist);
    const error = new HttpError("Cannot signup, email already exist", 422);
    return next(error);
  }
  let hashPassword;
  try{
    hashPassword=await bycrypt.hash(password,12);
  }
  catch(err){
    console.log(err);
    return next(new HttpError("Failed to signup", 500));
  }
  const newUser = new Users({
    name: name,
    email: email,
    password: hashPassword,
    image: req.file.path,
    posts: [],
  });
  // console.log(newUser);
  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Failed to signup", 422));
  }

  let token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    "somesecret",
    { expiresIn: "1h" }
  );
  res.json({
    message: "successfull signed up",
    userId: newUser.id,email:newUser.email,
    token:token,
  });
};

exports.postSignIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Error in input data, please check it", 422));
  }
  const { email, password } = req.body;
  let user;
  try {
    user = await Users.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Failed to sign in please try again", 422));
  }
  // console.log(user);
  if (!user) {
    const error = new HttpError("Email is wrong", 401);
    return next(error);
  }
  let hashPassword=false;
  try{
    hashPassword=await bycrypt.compare(password,user.password);
  }
  catch(err){
     return next(new HttpError("Failed to sign in please try again", 500));
  }
  if (!hashPassword) {
    const error = new HttpError("Password is wrong", 401);
    return next(error);
  }
  let token = jwt.sign(
    { userId: user.id, email: user.email },
    "somesecret",
    {expiresIn:'1h'}
  );
  res.json({
    message: "successfully signed in",
    userId: user.id,
    email: user.email,
    token: token,
  });
};
