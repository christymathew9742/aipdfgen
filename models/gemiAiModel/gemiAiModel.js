const mongoose = require('mongoose');

// AiModal Schema
const AiSchema = new mongoose.Schema({
  dId:{type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true  },
  contact: { type: String, required: true  },
  doctor: { type: String, required: true  },
  date: { type: String, required: true  },
  token: { type: Number, required: true  },
  department: { type: String, required: true },
  status: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = {
  AiModal: mongoose.model('AiModal', AiSchema),
};





