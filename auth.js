const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwtSecretKey = 'helpappTopSecretKey';

const userTypes = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  DEFAULT: 3
};

// MongoDB config
const db = 'mongodb://userhelpapp:passhelpapp1@ds115154.mlab.com:15154/helpappdb';
mongoose.connect(db, { useNewUrlParser: true }, err => {
  if(err) {
    console.error('# Connection to MongoDB failed ==> ' + err);
  } else {
    console.log('# Connected to MongoDB!');
  }
});

// Verify Default JWT
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

module.exports = {
    jwtSecretKey,
    userTypes,
    verifyToken,
    verifyAdminToken,
    verifySuperAdminToken
}
