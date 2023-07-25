const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Number,
    default: 0
  },
  address: [{
    addressType: {
      type: String,
      required: false
    },
  
    city: {
      type: String,
      required: false
    },
    district: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    zip: {
      type: String,
      required: false
    },
    country: {
      type: String,
      required: false
    }
  }],
  wallet: {
    type: Number,
    default: 0
  },
  phone: {
    type: Number,
    required: false
  },
  otp: {
    type: Number,
    required: false
  },
  isBlock: {
    type: Boolean,
    default: false
  },
  referralCode: {
    type: String
  },
  referralCodeUsed: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);
