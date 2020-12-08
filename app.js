// Importing Express Package
const express = require('express');
const app = express();
const cors = require('cors'); 
require('dotenv').config();
// Importing Body Parser
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
// Importing Router Files
const student = require('./routes/student');
const verify = require('./routes/verify');
const scanner = require('./routes/scanner');
const setting = require('./routes/setting');
const home = require('./routes/home');

const mongoose = require('mongoose');

// const connectionURL = "mongodb://127.0.0.1:27017";

// Setting up Connection with MongoDB (Cloud MongoDB )
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true,useUnifiedTopology: true})

    .then(response=> {
        console.log("Mongo Db is connected")
    })

    .catch(err=>{
        console.log("MongoDb failed");
    });

app.use(cors({credentials:true}));
// Set Ejs Template Engine
app.set('view-engine','ejs');
mongoose.set('useFindAndModify', true);
// Serve Static Files
// app.use(express.static(__dirname));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(fileUpload());

app.use('/admin',student);
app.use('/verify',verify);
app.use('/scanner',scanner);
app.use('/setting',setting);
app.use('/',home);

// app.get('/',(req,res)=>{
//     res.render("update.ejs");
// })

app.listen(process.env.PORT || 3000,()=>{
    console.log("App is Connected");
});


