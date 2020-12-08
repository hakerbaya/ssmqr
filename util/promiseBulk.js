// Lets Create a custom promise 
const csvtojson = require("csvtojson");
const Qrcode = require('qrcode');
const student = require('../modals/student.modal.js');
const saveStudents = (file)=>
new Promise((resolve, reject)=>{
    if(file){
        csvtojson().
            fromString(file)
            .then((studentData)=>{
                studentData.forEach(element=>{
                     let qrCode = '';
                     
                     Qrcode.toDataURL(element.enrollId,{errorCorrectionLevel:"H"},(err,url)=>{
                    if(err){
                        res.status(500).json({message: "Something Weird Happened"});
                    } else{
                            element.qrCode = url;
                            element.pic = "default.png";
                            new student(element)
                                .save()
                                .catch((err)=>{console.log(err)});
                            resolve("resolved");
                        }
                    })
                    
            });
            
        });
        
    } else{
        reject("rejected");

    }
});

module.exports = saveStudents;