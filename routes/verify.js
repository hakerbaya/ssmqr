const express = require('express');
const router = express.Router();

// Route for Validating QR Code
router.get('/:id',(req,res)=>{
    student.findOne({'enrollId' : req.params.id})
    .then((response)=>{
            res.send(response);
        })

    .catch((err)=>{
         res.sendStatus(404);
    });

});

module.exports = router;