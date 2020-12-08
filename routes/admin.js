/************************************************/
const express = require('express');
require('dotenv').config();
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Qrcode = require('qrcode');
const jwt = require("jsonwebtoken");
const json2csv = require('json2csv').parse;
const xlsx = require('xlsx');

/***********************************************/
const upload = require("../util/multer.js")
const verifyToken = require("../auth/auth.js");
const paginatedResults = require("../util/pagination.js");
const saveStudents = require("../util/promiseBulk.js")
const student = require('../modals/student.modal');
const admin = require("../modals/admin.modal");
const fileCSV = require("../modals/fileCSV.modal");
const template = require('../template/template.js');

const secretKey = process.env.SECRET_KEY;

/******************************************
 * ALL GET ROUTES
 * ***************************************/
    // Get Route for Signup Page
    router.get('/register',(req,res)=>{
        res.render("signup_page.ejs");
    })


    // Get Route for Rendering Dashboard Page
        router.get('/',(req,res)=>{
            let bearerHeader = req.headers['cookie'];
            
            if(typeof(bearerHeader) !== 'undefined' && bearerHeader.startsWith("token=Bearer",0)){
            // lets split it and turn it into array and split at space
            let bearer = bearerHeader.split(' ');

            let bearerToken = bearer[1];
            // if Bearer Token Contains ";" 
            if(bearerToken !== 'undefined'){
                if(bearerToken[bearerToken.length-1] == ';'){
                    bearerToken = bearerToken.slice(0,-1);
                }
            }
            jwt.verify(bearerToken,secretKey,(err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.redirect("/admin/dashboard");
                }
            });
        } else{
                res.render('login_page.ejs');
        }
        });

    // Get Route for Admin Dashboard
        router.get('/dashboard',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render("index.ejs");
                    
                }
            });
        });

    // Get Route for Add Students Page
        router.get('/add',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render('add_student.ejs',{msg:''});
                }
            });
        });



    // Get Route for Rendering Student List Page, Also Handle Here all filter Requests
        router.get('/all', verifyToken,paginatedResults(student), (req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render("students_list.ejs",{data:res.paginatedResults});
                }
            });

        });

    // Get Route for Getting Particular Student ID Card Information
        router.get('/edit/:id',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    let id = req.params.id;
                    var qrURL = '';
                    student.findOne({'enrollId' : id})
                        .then((response)=>{
                            res.render('edit_student.ejs',{data:response});
                })
                
                        .catch((err)=>{
                    
                            res.render('404.ejs');
                    
                    
                    });
                }
            });
            
        });


    // Route for ID CARD
        router.get('/idcard',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    let id = req.query.id;

                    student.findOne({'enrollId' : id})

                    .then((response)=>{
                        res.render('id_card.ejs',{data:response})
                    })

                    .catch((err)=>{
                        res.render("404.ejs");
                    })
                }
            });
            

        });

    // Route for searching Particular Student
        router.get('/search',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    student.findOne({'enrollId' : req.query.id})
                    .then((response)=>{
                            res.send(response);
                        })

                    .catch((err)=>{
                        res.sendStatus(404);
                    });
                }
            });
            

        });

    // Route for Bulk Students Page
        router.get('/bulk',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render('bulk_students.ejs');
                }
            });
            
        });
    // Route for XLS Converter Page
        router.get('/xls',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    fileCSV.find().
                    then((resp)=>{
                        res.render('xls_converter_page.ejs',{data:resp});
                    });
                    
                }
            });
        })

    // Route for template of csv
        router.get('/template',template.get);

    // Route for Student Data Page
        router.get('/data',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render('student_data_page.ejs');
                }
            }); 
        });

    //Route for Settings Page
        router.get('/setting',verifyToken,(req,res)=>{
            
            jwt.verify(req.token,secretKey,(err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    res.render('setting_page.ejs');
                }
            })
        });

    // Route for Forgot Password Page
        router.get('/forgot',(req,res)=>{
            res.render("forgot_pwd.ejs");
        });
   

/******************************************
 * ALL POST ROUTES
 * ***************************************/

    // Route for Registering New User
        router.post('/api/register',(req,res)=>{

            // master key
            const masterKey = "iloveallah";
           
            if(req.body.masterKey != masterKey){
                res.status(403).json({message: "Not Allowed To Create User"});
            } else{
                let newAdmin = new admin({
                    userName: req.body.username,
                    password: req.body.password
                });
            
                newAdmin.
                save()
                .then(message => res.status(200).json({"message": "User Successfully Registered","status": 1}))
                .catch(err => res.status(403).json({"message": err,"status": 0}));
            }
});


    // Post Route for Making New Student ID Card
        router.post('/',verifyToken,upload,(req,res)=>{
            

            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    let qrCode = '';
                    Qrcode.toDataURL([req.body.enrollId].toString(),{errorCorrectionLevel:"H"},(err,url)=>{
                        if(err){
                            console.log("Error in Generating QrCode");
                            
                        } else{
                            
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
                            .catch(err => res.status(403).json({message: err}));
                
                        }
                        
                    });
                
                }
            });
            
            
        });

    // Route for Validating Username and Password, to send Token.
        router.post('/api',async (req,res)=>{
            const user = {
                username: req.body.username,
                password: req.body.password
            }
            let userAdmin = await admin.findOne({'userName' : req.body.username});
            
            if(userAdmin == null){
                res.status(404).json({status: 0});
            } else{
                admin.findOne({'userName' : req.body.username})
                    .exec((err,adminUser)=>{
                        if(err){
                            res.status(500).json({message:"Internal Error"});
                        } else{
                            if(adminUser.password == req.body.password){
                                jwt.sign({user:user}, secretKey,(err,token)=>{
                                    if(err){
                                        // Unauthorized Access
                                        res.sendStatus(500);
                                    } else{
                                        
                                        // res.cookie("accessToken", "123");
                                        res
                                            .writeHead(200, {
                                            "Set-Cookie": `token=Bearer ${token}`,
                                            "Access-Control-Allow-Credentials": "true"
                                            })
                                            .send();
                                        
                                    }
                                    
                                });
                            } else{
                                res.status(403).json({message: "Invalid Password"});
                            }
                        }
                            
                        })
            }
            

                    
        });

        // Route for Uploading CSV Files
        router.post('/bulk',verifyToken,upload,(req,res)=>{
            if(!req.file)
                return res.status(400).send("No Files were Uploaded");
            let dir = path.dirname(require.main.filename);
            let old_file_name = req.file.filename;
            let file = dir+"\\public"+`\\uploads\\${old_file_name}`;
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    saveStudents(fs.readFileSync(file).toString())
                        .then((data)=>{
                            res.send(`File Uploaded ;)`);
                        })
                        .catch((err)=>{
                            res.send(`Try Again, ${err}`);
                        });
                    }
            });
        });
    // Route for Uploading XLS File and Converting to CSV
        router.post('/xls',verifyToken,upload,(req,res)=>{
            let dir = path.dirname(require.main.filename);
            
            
            
            let old_file_name = req.file.filename;
            let file_name = Date.now() + `${old_file_name}`+".csv";
            let file = dir+"\\public"+`\\uploads\\${old_file_name}`;
            let obj = {fileName: file_name};
            
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    // let file = req.files.file.data;
                    
                    
                    
                    
                    const workBook = xlsx.readFile(file);
                    // let old_file_name = req.file.filename.split('.');
                    // let old_file_name = req.file.filename.split('.');
                    
                    
                    xlsx.writeFile(workBook, `public/${file_name}`, { bookType: "csv" });
                    new fileCSV(obj).
                    save()
                    .then(()=>{
                        fileCSV.find().then((response)=>{
                            res.render("xls_converter_page.ejs",{data: response});
                        })
                        
                    })
                    .catch((err)=>{console.log(err)});

                    
                }
            });
        });

    // Route for Student data
        router.post('/data',verifyToken,(req,res)=>{
            let semester = req.body.semester;
            let section = req.body.section;
            let fields = ["enrollId","pic","qrCode","firstName","middleName","lastName","gender","dob","parentage","address","department","semester","section","busStop"];
            
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    
                    
                    // Try to make Reusable function for all cases

                    if(semester == '0' && section == '0'){
                        student.find().then((response)=>{
                            let csv;
                            
                            try{
                                csv = json2csv(response,{fields});
                            }
                             catch(err){
                                return res.status(500).json({err});
                             }
                             res.set('Content-Disposition', 'attachment;filename=students_template.csv')
                             res.set('Content-Type', 'application/octet-stream')
                         
                             res.send(csv);
                        })
                        
                    }

                    if(semester == '0' && section !='0'){
                        student.find({section: section}).then((response)=>{
                            let csv;
                            
                            try{
                                csv = json2csv(response,{fields});
                            }
                             catch(err){
                                return res.status(500).json({err});
                             }
                             res.set('Content-Disposition', 'attachment;filename=students_template.csv')
                             res.set('Content-Type', 'application/octet-stream')
                         
                             res.send(csv);
                        });
                    }

                    if(semester != '0' && section =='0'){
                        student.find({semester: semester}).then((response)=>{
                            let csv;
                            
                            try{
                                csv = json2csv(response,{fields});
                            }
                             catch(err){
                                return res.status(500).json({err});
                             }
                             res.set('Content-Disposition', 'attachment;filename=students_template.csv')
                             res.set('Content-Type', 'application/octet-stream')
                         
                             res.send(csv);
                        })
                    }

                    if(semester != '0' && section != '0'){
                        student.find({section: section}).then((response)=>{
                            let csv;
                            
                            try{
                                csv = json2csv(response,{fields});
                            }
                             catch(err){
                                return res.status(500).json({err});
                             }
                             res.set('Content-Disposition', 'attachment;filename=students_template.csv')
                             res.set('Content-Type', 'application/octet-stream')
                         
                             res.send(csv);
                        })
                    }
                    

                }
            });
        })
    //  Route for Changing Password
    router.post('/setting',verifyToken,(req,res)=>{
        
        jwt.verify(req.token,secretKey,(err,authData)=>{
            if(err){
                
                res.sendStatus(403);
            } else{
                let oldPass = req.body.oldPass;
                let newPass = req.body.newPass;
                
                if(oldPass == authData.user.password){
                    admin.findOneAndUpdate({userName: authData.user.username},{$set: {password: newPass}})
                    .then(()=>{
                      
                           res.status(200).json({message:"Password Changed"});
                       
                    })
                    .catch((err)=>{
                        res.status(403).json({err});
                    })
                } else{
                    res.sendStatus(403);
                }
            }
        })
    });

    //  Route for Forgot Password
        router.post('/forgot',(req,res)=>{
            let userName = req.body.userName;
            let masterKey = req.body.masterKey;
            let newPassword = req.body.newPassword;
            
            if(masterKey == 'iloveallah'){
                admin.findOneAndUpdate({userName: userName},{$set:{password: newPassword}})
                .then((response)=>{
                    res.status(200).json({message: "Password Changed"})
                })
                .catch((err)=>{
                res.send(403).json({err});
                })
             } else{
                 res.sendStatus(403);
             }
        });


/******************************************
 * ALL PUT ROUTES
 * ***************************************/

    // Update Route for Updating Student ID Card
        router.put('/edit/:id',verifyToken,async (req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    // let filePath = "";
            let query ={enrollId : req.params.id};
            let newObj = {};
            Object.keys(req.body).forEach((key)=>{
                if(key!= "enrollId"){
                    
                    newObj[key] = req.body[key];
                }
                
                
            });
           
            student.findOneAndUpdate(query, { $set: newObj})
                .then((response)=>{
                    // filePath = `../../uploads/${response.pic}`;
                res.render("edit_student.ejs",{data:response});
                })

                .catch((err)=>{
                console.log("Failed to Update Student Details");
                });
                }
            });
            
        });

    // Router for Changing Profile Pic
        router.put('/changePic',verifyToken,upload,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    let query ={enrollId : req.query.id};

                    // Find Pic Name and Delete it first
                    student.findOne(query)

                    .then((response)=>{
                        try{
                            let filePath = `./uploads/${response.pic}`;
                            fs.unlinkSync(filePath);
                           
                        } catch(err){
                           
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

                        }
            });
        });

    


/******************************************
 * ALL DELETE ROUTES
 * ***************************************/

        // Delete Route for Deleting Student ID Card
        router.delete('/delete',verifyToken,(req,res)=>{
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    let id =  req.query.id;

            
            // Find Pic Name and Delete it first
            student.findOne({enrollId:id})

            .then((response)=>{
                try{
                    let filePath = `./uploads/${response.pic}`;
                    fs.unlinkSync(filePath);
                    
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
                }
            });
            
        });
    //Delete XLS File from Database and Folder
        router.delete('/xls',verifyToken,(req,res)=>{
            let file_name = req.query.filename;
            jwt.verify(req.token, secretKey, (err,authData)=>{
                if(err){
                    res.sendStatus(403);
                } else{
                    
                    // Find The Filenname in Database
                    fileCSV.deleteOne({fileName: file_name})
                    
                    .then(()=>{
                        let dir = path.dirname(require.main.filename);
                        
                        // fs.unlinkSync(dir+"\\public"+"\\"+filename);
                        fs.unlinkSync(dir+"\\public"+`\\${file_name}`);
                        res.status(200).json({message : "deleted", status: 1});
                    })
                    .catch((err)=>{
                        res.status(403).json({message: err});
                    })
                    // Find the Location Of File and Delete it.
                    
                }
            
            });
        })


module.exports = router;