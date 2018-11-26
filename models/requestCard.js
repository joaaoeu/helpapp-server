const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const requestCardSchema = new Schema({
  creatorId: String,
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date },
  name: String,
  productModel: String,
  description: String,
  status: Number,
});

module.exports = mongoose.model('requestCard', requestCardSchema, 'requestCards');
