const { userTypes, verifyToken, verifyAdminToken } = require('../auth');
const express = require('express');
const router = express.Router();

const statusTypes = {
  OPENED: 1,
  CLOSED: 2,
  CANCELED: 3
};

// Models
const User = require('../models/user');
const RequestCard = require('../models/requestCard');

// ENDPOINT: [POST] /requestCards
router.post('/requestCards', verifyToken, (req, res) => {
  let requestCardData = req.body;
  
  if(!requestCardData.name || !requestCardData.productModel || !requestCardData.description) {
    res.status(400).send({message: 'Input incorrect!'});
  } else {
    requestCardData.creatorId = req.user._id;
    requestCardData.status = statusTypes.OPENED;
    let requestCard = new RequestCard(requestCardData);
    
    requestCard.save((err, requestedCard) => {
      if(err) {
        console.log(err);
      } else {
        res.status(201).send({requestedCard});
      }
    });
  }
});

// ENDPOINT: [GET] /requestCards
router.get('/requestCards', verifyToken, (req, res) => {
  RequestCard.find(
    req.user.userType === userTypes.DEFAULT
    ? { creatorId: req.user._id }
    : {}
  ).sort({_id: 'desc'}).exec(function(err, requestCards) {
    if (!err) {
      const requestCardsWithCreator = requestCards.map(async (requestCard) => {
        const creator = await User.findOne({_id: requestCard.creatorId});
        
        return {
          _id: requestCard._id,
          name: requestCard.name,
          productModel: requestCard.productModel,
          description: requestCard.description,
          status: requestCard.status,
          startAt: requestCard.startAt,
          endAt: requestCard.endAt ? requestCard.endAt : null,
          creatorName: creator.name,
          creatorEmail: creator.email
        }
      });
      
      Promise.all(requestCardsWithCreator).then((requestCardsWithCreator) => {
        res.status(200).json(requestCardsWithCreator);
      });
    } else {
      console.log(err);
    }
  });
});

// ENDPOINT: [PUT] /requestCards
router.put('/requestCards', verifyAdminToken, (req, res) => {
  let requestCardData = req.body;
  
  if(!requestCardData._id || !requestCardData.name || !requestCardData.productModel || !requestCardData.description || !requestCardData.status) {
    res.status(400).send({message: 'Input incorrect!'});
  } else {
    if(requestCardData.status === statusTypes.CLOSED || requestCardData.status === statusTypes.CANCELED) {
      requestCardData.endAt = Date.now();
      updateRequestCard(requestCardData, res);
    } else {
      updateRequestCard(requestCardData, res);
    }
  }
});

function updateRequestCard(requestCardData, res) {
  RequestCard.findOneAndUpdate({_id: requestCardData._id}, requestCardData, {new: true}, (err, requestCard) => {
    if (err) {
      res.status(400).send(err);
    } else {
      User.findOne({_id: requestCard.creatorId}, (err, creator) => {
        res.status(201).send({
          requestCard: {
            _id: requestCard._id,
            name: requestCard.name,
            productModel: requestCard.productModel,
            description: requestCard.description,
            status: requestCard.status,
            startAt: requestCard.startAt,
            endAt: requestCard.endAt ? requestCard.endAt : null,
            creatorName: creator.name,
            creatorEmail: creator.email
          }
        });
      });
    }
  });
}

// ENDPOINT: [DELETE] /requestCards
router.delete('/requestCards', verifyAdminToken, (req, res) => {
  let requestCardData = req.body;
  
  RequestCard.findOneAndDelete({ _id: requestCardData._id }, function(err) {
    if (!err) {
      res.status(204).send();
    } else {
      res.status(400).send({message: 'Can\'t delete request card!'});
    }
  });
});

module.exports = router;
