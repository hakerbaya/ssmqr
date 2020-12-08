

function verifyToken(req,res,next){
    //First thing is to get the authorization header
    const bearerHeader = req.headers['cookie'];
   
    if(typeof(bearerHeader) !== 'undefined' && bearerHeader.startsWith("token=Bearer",0)){
        
        // lets split it and turn it into array and split at space
        const bearer = bearerHeader.split(' ');

        let bearerToken = bearer[1];
        // if Bearer Token Contains ";" 
        if(bearerToken !== 'undefined'){
            if(bearerToken[bearerToken.length-1] == ';'){
                bearerToken = bearerToken.slice(0,-1);
            }
        }
        
        req.token = bearerToken;
        console.log(req.token);
        next();

    } else{
        // Forbidden
        res.status(403).redirect("/admin");
    }

}


module.exports = verifyToken;

