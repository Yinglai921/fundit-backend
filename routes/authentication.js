const Authentication = require('../modules/authentication');
const passportService = require('../services/passport');
const passport = require('passport');
const User = require('../models/user');
const Search = require('../modules/search');

const express = require('express');
const router = express.Router();

const requireAuth = passport.authenticate('jwt', { session: false});
const requireSignin = passport.authenticate('local', { session: false});


router.route('/mypage')
      .get(requireAuth, function(req, res){
          let user = req.user;
          res.send({message: user})
      })

router.route('/mypage')
      .post(requireAuth, function(req, res){
          // save the search queries to the user
          let email = req.user.email;
          let searchQueries = req.body.queries;
          let index = req.app.get('index'); 

          function setTopicsToSearchQueries(){
              return new Promise(function(resolve, reject){
                    let count = 0;
                    searchQueries.map(searchTopics)
                    
                    function searchTopics(query){
        
                        let scopes = {
                            inTitle: true,
                            inKeywords: true,
                            inTags: true,
                            inDescription:true,
                            inOpen: true
                        }
            
                        tempQuery = Search.formSearchQuery(query.query, scopes);
                        let searchResults = [];
                        index.search(tempQuery)
                                .on("data", function(doc){
                                    searchResults.push(doc['document']);
                                })
                                .on('end', function(){
                                    query.topics = searchResults;
                                    count += 1;
                                    if (count == searchQueries.length){
                                        resolve();
                                    }
                                    return query;
                                })
                    }
              })
          }

          User.findOne({email}, function(err, user){
              if(err) throw err;
              // save queries to User 

              //!!!!!!!!!BUG!!!!!!!!!! it saved the hashed psw....
              
              setTopicsToSearchQueries().then(() =>{
                    user.searchQueries = searchQueries; 
                    user.save(function(err){
                        if (err) throw err;
                        //res.send({message: 'User successfully updated!'})
                        res.send({message: user})
                    })
              })

          })

      })

router.route('/signin')
    .post(requireSignin, Authentication.signin);
router.route('/signup')
    .post(Authentication.signup);

module.exports = router;