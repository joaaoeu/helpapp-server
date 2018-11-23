const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwtSecretKey = 'helpappTopSecretKey';

const userTypes = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  DEFAULT: 3
};

// Models
const User = require('../models/user');

// MongoDB config
const db = 'mongodb://userhelpapp:passhelpapp1@ds115154.mlab.com:15154/helpappdb';
mongoose.connect(db, { useNewUrlParser: true }, err => {
  if(err) {
    console.error('# Connection to MongoDB failed ==> ' + err);
  } else {
    console.log('# Connected to MongoDB!');
  }
});

// Verify JWT
function verifyToken(req, res, next) {
  if(!req.headers.authorization) return res.status(401).send('Unauthorized');
  
  let token = req.headers.authorization.split(' ')[1];
  if(token === 'null') return res.status(401).send('Unauthorized');
  
  let payload = jwt.verify(token, jwtSecretKey);
  if(!payload || !payload.user)
    return res.status(401).send('Unauthorized');
  
  req.user = payload.user;
  next();
}

// Verify Admin JWT
function verifyAdminToken(req, res, next) {
  if(!req.headers.authorization) return res.status(401).send('Unauthorized');
  
  let token = req.headers.authorization.split(' ')[1];
  if(token === 'null') return res.status(401).send('Unauthorized');
  
  let payload = jwt.verify(token, jwtSecretKey);
  if(!payload || !payload.user || (payload.user.userType !== userTypes.SUPER_ADMIN && payload.user.userType !== userTypes.ADMIN))
    return res.status(401).send('Unauthorized');
  
  req.user = payload.user;
  next();
}

// Verify Super Admin JWT
function verifySuperAdminToken(req, res, next) {
  if(!req.headers.authorization) return res.status(401).send('Unauthorized');
  
  let token = req.headers.authorization.split(' ')[1];
  if(token === 'null') return res.status(401).send('Unauthorized');
  
  let payload = jwt.verify(token, jwtSecretKey);
  if(!payload || !payload.user || payload.user.userType !== userTypes.SUPER_ADMIN)
    return res.status(401).send('Unauthorized');
  
  req.user = payload.user;
  next();
}

// ENDPOINT: [POST] /login
router.post('/login', (req, res) => {
  let userData = req.body;
  
  User.findOne({email: userData.email}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (!user || user.password !== userData.password) {
        res.status(401).send({message: 'Email or password is incorrect!'});
      } else {
        let payload = { user };
        let token = jwt.sign(payload, jwtSecretKey)
        res.status(200).send({
          user: {
            name: user.name,
            email: user.email,
            userType: user.userType
          },
          token
        });
      }
    }
  });
});

// ENDPOINT: [POST] /members
router.post('/members', verifySuperAdminToken, (req, res) => {
  let userData = req.body;
  
  if(!userData.name || !userData.email || !userData.password || !userData.userType || (userData.userType !== userTypes.ADMIN && userData.userType !== userTypes.DEFAULT)) {
    res.status(400).send({message: 'Input incorrect!'});
  } else {
    User.findOne({email: userData.email}, (err, user) => {
      if (user) {
        res.status(400).send({message: 'Email is being used by another member!'});
      } else {
        let user = new User(userData);
        
        user.save((error, registeredUser) => {
          if(error) {
            console.log(error);
          } else {
            res.status(200).send({
              user: {
                name: registeredUser.name,
                email: registeredUser.email,
                userType: registeredUser.userType
              }
            });
          }
        });
      }
    });  
  }
});

module.exports = router;
