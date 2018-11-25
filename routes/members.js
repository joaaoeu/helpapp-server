const { userTypes, verifySuperAdminToken } = require('../auth');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Models
const User = require('../models/user');

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
        bcrypt.hash(userData.password, 10, function(err, hash) {
          userData.password = hash;
          
          let user = new User(userData);
          
          user.save((err, registeredUser) => {
            if(err) {
              console.log(err);
            } else {
              res.status(201).send({
                user: {
                  _id: registeredUser._id,
                  name: registeredUser.name,
                  email: registeredUser.email,
                  userType: registeredUser.userType
                }
              });
            }
          });
        });
      }
    });  
  }
});

// ENDPOINT: [GET] /members
router.get('/members', verifySuperAdminToken, (req, res) => {
  User.find({}).sort({_id: 'desc'}).exec(function(err, members) {
    if (!err) {
      members = members.map((member) => {
        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          userType: member.userType
        }
      }).filter((member) => {
        return member.userType !== userTypes.SUPER_ADMIN
      });
      
      res.status(200).json(members);
    } else {
      console.log(err);
    }
  });
});

// ENDPOINT: [PUT] /members
router.put('/members', verifySuperAdminToken, (req, res) => {
  let userData = req.body;
  
  if(!userData.name || !userData.email || !userData.userType || (userData.userType !== userTypes.ADMIN && userData.userType !== userTypes.DEFAULT)) {
    res.status(400).send({message: 'Input incorrect!'});
  } else {
    if(userData.password) {
      bcrypt.hash(userData.password, 10, function(err, hash) {
        userData.password = hash;
        updateUser(userData, res);
      });
    } else {
      updateUser(userData, res);
    }
  }
});

function updateUser(userData, res) {
  User.findOneAndUpdate({_id: userData._id}, userData, {new: true}, (err, user) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(201).send({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType
        }
      });
    }
  });
}

// ENDPOINT: [DELETE] /members
router.delete('/members', verifySuperAdminToken, (req, res) => {
  let userData = req.body;
  
  if(userData.userType !== userTypes.ADMIN && userData.userType !== userTypes.DEFAULT) {
    res.status(400).send({message: 'Can\'t delete member!'});
  } else {
    User.findOneAndDelete({ _id: userData._id }, function(err) {
      if (!err) {
        res.status(204).send();
      } else {
        res.status(400).send({message: 'Can\'t delete member!'});
      }
    });
  }
});

module.exports = router;
