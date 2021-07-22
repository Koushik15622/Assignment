require('dotenv').config();
var express = require("express");
var session = require("express-session");
var cp = require("cookie-parser");
var ms = require("connect-mongo");
var bp = require('body-parser');
var fs = require("fs");
var path = require("path");
var morgan = require("morgan");
var multer = require("multer");
var User = require('./backend/model');
var app = express();

app.use(morgan('dev'));
app.use(express.static(__dirname+"/public"));
app.use(bp.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(session({
    key: "user_sid",
    secret: "IDONTKNOW",
    resave: false,
    saveUninitialized: false,
    store: ms.create({
      mongoUrl: process.env.MCS,
      ttl: 600,
      autoRemove: 'native'
    }),
  })
);

var sessionChecker = (req, res, next) => {
    if (!req.session.user) {
     res.redirect("/");
    } else {
      next();
    }
  };

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, req.session.user.username);
    }
});
 
var upload = multer({ storage: storage });

app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/html/home.html");
})

app.get("/profile",sessionChecker,async function(req,res){
    await User.findOne({email:req.session.user.email},(err,data)=>{
      res.render("profile",{uname:req.session.user.username,email:req.session.user.email,image:data});
    })
});

app.get("/list",sessionChecker,function(req,res){
  User.find({active:true},(err,list)=>{
    //console.log(list);
    res.render("list",{data:list , uname:req.session.user.username});
  })
})

app.get("/login",function(req,res){
    if(req.session.user) res.redirect("/profile");
    res.sendFile(__dirname+"/public/html/login.html");
});

app.get("/register",function(req,res){
  if(req.session.user) res.redirect("/profile");  
  res.sendFile(__dirname+"/public/html/reg.html");
});

app.get("/logout",function(req,res){
  if (req.session.user) {
    req.session.destroy();
    res.redirect("/");
    } 
  else {
    res.redirect("/login");
    }
});

app.post("/login",async function(req,res){
    var username = req.body.username,
      password = req.body.password;

      try {
        var user = await User.findOne({ username: username }).exec();
        await User.updateOne({username:username},{$set:{active:true}},function(err,obj){
          if(err) console.log(err);
        })
        //console.log("User found in db"+user);
         if(!user) {
             //console.log("went to login frm if");
            res.redirect("/login");
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.redirect("/login");
            }
        });
        user.img = null;
        //console.log(user);
        req.session.user = user;
        req.session.save();
        res.redirect("/profile");
    } catch (error) {
      console.log(error)
    }

});

app.post("/register",function(req,res){
    //console.log(req.body);
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password:req.body.password,
        img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/def.m')),
          contentType: 'image/png'
      }
      });
      
      user.save((err, docs) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          docs.img = null;
          req.session.user = docs;
          req.session.save();
          res.redirect("/profile");
        }
      });
});
 
app.post('/profile',sessionChecker, upload.single('image'), async(req, res, next) => {
 
  var obj = {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/png'
      }
  await User.updateOne({"email": req.session.user.email},{$set:{"img":obj}}, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          res.redirect('/profile');
      }
  });
  //console.log(req.session.user);
});

app.delete("/profile/:id",async function(req,res){
    var em = req.params.id;
    await User.deleteOne({username:em},function(err,obj){
      if(err) console.log(err);
      else{
        req.session.destroy();
        res.redirect('/');
      }
    })
});

app.put("/profile/:id", function(req,res){
  var em = req.params.id;
  User.updateOne({username:em},{$set:{active:false}},function(err,obj){
    if(err) console.log(err);
    else{
      req.session.destroy();
      res.redirect('/');
    }
  })
});

var PORT = process.env.PORT || 5050;
app.listen(PORT,function(){
    console.log("server started on port "+PORT);
});