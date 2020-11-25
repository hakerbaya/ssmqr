// Importing Express Package
const express = require('express');
const app = express();
const cors = require('cors'); 
// Importing Body Parser
const bodyParser = require('body-parser');
// Importing Router Files
const student = require('./routes/student');
const admin= require('./routes/admin');
const verify = require('./routes/verify');
const scanner = require('./routes/scanner');
const setting = require('./routes/setting');
const home = require('./routes/home');

const mongoose = require('mongoose');
// Connecting to cloud MongoDB
const connectionURL = "mongodb+srv://hakerbaya:hakerbaya@cluster0.4cr36.gcp.mongodb.net/idcard?retryWrites=true&w=majority"

// Setting up Connection with MongoDB (Cloud MongoDB )
mongoose.connect(connectionURL, { useNewUrlParser: true,useUnifiedTopology: true})

    .then(response=> {
        console.log("Mongo Db is connected")
    })

    .catch(err=>{
        console.log("MongoDb failed");
    });

app.use(cors());
// Set Ejs Template Engine
app.set('view-engine','ejs');
// Serve Static Files
// app.use(express.static(__dirname));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use('/students',student);
// app.use('/admin',admin);
// app.use('/verify',verify);
// app.use('/scanner',scanner);
// app.use('/setting',setting);
// app.use('/',home);
app.get('/',(req,res)=>{
    res.render("update.ejs");
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("App is Connected");
});


