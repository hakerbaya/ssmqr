const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importing Mongoose for Connecting MongoDB

// Importing Student Schema
const student = require('../modals/student.modal');
// Importing QRCode Generator Package
const Qrcode = require('qrcode');

// Setting Disk Storage For Multer
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },

    filename: function(req,file,cb){
        cb(null,file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 51200000},
    fileFilter: function(req,file,cb){
        let extension = path.extname(file.originalname);
        if(extension!== '.png' && extension!== '.jpg' && extension!== '.jpeg'){
            return cb(new Error('Only Images are allowed'));
        }
        cb(null,true); 
    }
}).single('pic');




// Get Route for Rendering Dashboard Page
router.get('/',(req,res)=>{
    // res.render('student.ejs',{msg:''});
    res.send("Keep here Dashbaord Home Page")
});

// Get Route for Add Students Page
router.get('/add',(req,res)=>{
    res.render('add_student.ejs',{msg:''});
});

// Get Route for Rendering Student List Page, Also Handle Here all filter Requests
router.get('/all', paginatedResults(student), (req,res)=>{
   
// res.json(res.paginatedResults);
res.render("students_list.ejs",{data:res.paginatedResults});
// console.log(res.paginatedResults);

});

// Get Route for Getting Particular Student ID Card Information
router.get('/edit/:id',async (req,res)=>{
    
    let id = await req.params.id;
    var qrURL = '';
    student.findOne({'enrollId' : id})
        .then((response)=>{
        

        
        res.render('edit_student.ejs',{data:response});
})

.catch((err)=>{
    if(err){
        res.render('404.ejs');
    }
    
    });
});
// Post Route for Making New Student ID Card
router.post('/',upload,(req,res)=>{
    // console.log(req.body);
    // console.log(req.file);


var qrCode = '';
    Qrcode.toDataURL([req.body.enrollId].toString(),{errorCorrectionLevel:"H"},(err,url)=>{
        if(err){
            console.log("Error in Generating QrCode");
            
        } else{
            // console.log(url);
            qrCode = url;
            let studentt  = {
                pic: req.file.filename,
                enrollId: req.body.enrollId,
                qrCode :qrCode,
                firstName : req.body.firstName,
                middleName : req.body.middleName,
                lastName: req.body.lastName,
                gender : req.body.gender,
                dob : req.body.dob,
                parentage : req.body.parentage,
                address : req.body.address,
                department: req.body.department,
                semester: req.body.semester,
                section: req.body.section,
                busStop : req.body.busStop
            }
            let newStudent = new student(studentt);
            newStudent
              .save()
              .then(item => res.render('add_student.ejs',{msg:"Added New Student"}))
              .catch(err => res.status(400).json(`Error ${err}`));

        }
        
    });

    
});
// Update Route for Updating Student ID Card
router.put('/edit/:id',async (req,res)=>{
    // let filePath = "";
    let query ={enrollId : req.params.id};
    let newObj = {};
    Object.keys(req.body).forEach((key)=>{
        if(key!= "enrollId"){
            // console.log(key);
            newObj[key] = req.body[key];
        }
        
        
    });
    // console.log(newObj);
    student.findOneAndUpdate(query, { $set: newObj})
        .then((response)=>{
            // filePath = `../../uploads/${response.pic}`;
        res.render("edit_student.ejs",{data:response});
        })

        .catch((err)=>{
        console.log("Failed to Update Student Details");
        });
});

// Route for ID CARD
router.get('/idcard',(req,res)=>{
    let id = req.query.id;

    student.findOne({'enrollId' : id})

    .then((response)=>{
        res.render('id_card.ejs',{data:response})
    })

    .catch((err)=>{
        console.log(err);
    })

});

// Route for searching Particular Student
router.get('/search',(req,res)=>{
    student.findOne({'enrollId' : req.query.id})
    .then((response)=>{
            res.send(response);
        })

    .catch((err)=>{
         res.sendStatus(404);
    });

})
// Router for Changing Profile Pic
router.put('/changePic',upload,(req,res)=>{
    let query ={enrollId : req.query.id};

    // Find Pic Name and Delete it first
    student.findOne(query)

    .then((response)=>{
        try{
            let filePath = `./uploads/${response.pic}`;
            fs.unlinkSync(filePath);
            console.log("Successfully Deleted")
        } catch(err){
            console.log("Delete Failed");
        }
        
    });

    // We need to Update New File Name 
     student.findOneAndUpdate(query,{$set:{pic: req.file.filename}})

     .then((response)=>{
        res.render("edit_student.ejs",{data:response});
        

     })

     .catch((err)=>{
         console.log(err);
     })

})

// Delete Route for Deleting Student ID Card
router.delete('/delete',(req,res)=>{
    let id =  req.query.id;

    
    // Find Pic Name and Delete it first
    student.findOne({enrollId:id})

    .then((response)=>{
        try{
            let filePath = `./uploads/${response.pic}`;
            fs.unlinkSync(filePath);
            console.log("Successfully Deleted")
        } catch(err){
            console.log("Delete Failed");
        }
        
    });

    //Delete Entry in Database

    student.deleteMany({enrollId:id})
    .then(()=>{
        res.status(200).json("ok");
    })
    .catch(()=>{
        res.status(400).json({msg:"failed"});
    });
});

// Resuable Function for Pagination
function paginatedResults(model){
    return async (req,res,next) =>{
        const results = {};
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let sem = req.query.sem;

        // Check Conditions
        if(req.query.page == undefined || req.query.page == ""){
            req.query.page = 1
            page = 1;
        }
        if(req.query.limit == undefined || req.query.limit == ""){
            req.query.limit = 10;
            limit = 10;
        }
        if(req.query.sem == undefined || req.query.sem == ""){
            req.query.sem = "all";
            sem = "all";
        }
    
        const startIndex = (page-1) * limit;
        const endIndex = page * limit;
        
        
        if(endIndex < await model.countDocuments().exec()){
            
            results.next = {
                page: page+1,
                limit: limit,
                
            }
        } 
        
        if(startIndex > 0){
            results.previous = {
                page: page-1,
                limit: limit,
                
            }
        }

        // Setting Semester
        results.semester = sem;
        results.currentPage = page;
        results.currentLimit = limit;
        
        if(sem != "all"){
            results.results = await model
            .find({semester:sem})
            .limit(limit)
            .skip(startIndex)
            .sort()
            .exec();
        } else{
            results.results = await model
            .find()
            .limit(limit)
            .skip(startIndex)
            .sort()
            .exec();
        }
        
         
        // Store Results
        res.paginatedResults = results;
        next();
    }
}


module.exports = router;