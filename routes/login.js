const { jwtSecretKey } = require('../auth');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user');

// ENDPOINT: [POST] /login
router.post('/login', (req, res) => {
  let userData = req.body;
  
  User.findOne({email: userData.email}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (!user) {
        res.status(401).send({message: 'Email or password is incorrect!'});
      } else {
        bcrypt.compare(userData.password, user.password, function(err, equal) {
          if(!equal) {
            res.status(401).send({message: 'Email or password is incorrect!'});
          } else {
            let payload = { user };
            let token = jwt.sign(payload, jwtSecretKey)
            res.status(200).send({
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
              },
              token
            });  
          }
        });
      }
    }
  });
});

module.exports = router;
