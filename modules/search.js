function formQuery(query, searchArray, notArray, scope){
    
    if (scope.inTitle){
        let queryObj = {'AND':{},'NOT':{}};
        queryObj.AND.title = searchArray;
        if (scope.inOpen){
            queryObj.NOT.callStatus = ['closed'];
        }
        if (notArray !== undefined && notArray.length > 0){
            queryObj.NOT.title = notArray;
        }
        query.query.push(queryObj)
    }
    if (scope.inKeywords){
        let queryObj = {'AND':{},'NOT':{}};
        queryObj.AND.keywordstr = searchArray;
        if (scope.inOpen){
            queryObj.NOT.callStatus = ['closed'];
        }
        if (notArray !== undefined && notArray.length > 0){
            queryObj.NOT.keywordstr = notArray;
        }
        query.query.push(queryObj)
    }

    if (scope.inTags){
        let queryObj = {'AND':{},'NOT':{}};
        queryObj.AND.tagstr = searchArray;
        if (scope.inOpen){
            queryObj.NOT.callStatus = ['closed'];
        }
        if (notArray !== undefined && notArray.length > 0){
            queryObj.NOT.tagstr = notArray;
        }
        query.query.push(queryObj)
    }
    if (scope.inDescription){
        let queryObj = {'AND':{},'NOT':{}};
        queryObj.AND.description = searchArray;
        if (scope.inOpen){
            queryObj.NOT.callStatus = ['closed'];
        }
        if (notArray !== undefined && notArray.length > 0){
            queryObj.NOT.description = notArray;
        }
        query.query.push(queryObj)
    }

}



exports.formSearchQuery = function(term, scope){

    let notArray;
    const query = {};
    query.query = [];
    query.pageSize = 3000;

    if (term.indexOf("NOT") !== -1){
        notArray = term.split("NOT")[1]; // we assume there is only one NOT appear
        term = term.slice(0, term.indexOf("NOT"));
        notArray = notArray.split(" ")
            .filter((item) => { return item.length > 1})
            .map((item) =>{ return item.toLowerCase()})
    }

    if (term.indexOf("OR") !== -1){
        let termArray = term.split("OR");
        termArray.forEach((data) => {
            let searchArray = data.split(" ");
             formQuery(
                    query,
                    searchArray.filter((item) => {return item.length > 1}).map((item) =>{ return item.toLowerCase()}),
                    notArray,
                    scope
                );
        })
    } else {
        if (term == "*"){
            formQuery(["*"])
        } else {
            let termArray = term.split(" ");
             formQuery(
                query,
                termArray.filter((item) => {return item.length > 1}).map((item) =>{ return item.toLowerCase()}),
                notArray,
                scope
            );
        }
    }

    return query;

}