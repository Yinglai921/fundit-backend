const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../configs/authconfig');
const bcrypt = require('bcrypt-nodejs');

function tokenForUser(user){
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next){
    let email = req.body.email;
    let password = req.body.password;


    if (!email || !password){
        return res.status(422).send({error:'You must provide email and password'});
    }
    // see if a user with the given email exits
    User.findOne({ email: email }, function(err, existingUser){
        if (err) { return next(err); }

        // if a user with email does exist, return an error
        if (existingUser){
            return res.status(422).send({error: 'Email is in use.'});
        }
        // if a user with email does NOT exist, create and save the record

        // hash the psw first, encrypt the password
        // generate a salt, then run callback
        bcrypt.genSalt(10, function(err, salt){
            if(err){return next(err);}

            // hash our password using the salt
            bcrypt.hash(password, salt, null, function(err, hash){
                if(err){return next(err);}
                // overwrite plain text password with encrypted password
                password = hash;
                
                const user = new User({
                    email: email,
                    password: password,
                    searchQueries:[]
                });
        
                user.save(function(err){
                    if(err){ return next(err); }
        
                    // respond to request indication the user was created
                    res.json({ token: tokenForUser(user) });
                });

            });
        });
    });
}

exports.signin = function(req, res, next){
    // User has already had their emails and password auth'd
    // we just need to give them a token
    res.send({ token: tokenForUser(req.user)});
}