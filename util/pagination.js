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

module.exports = paginatedResults;