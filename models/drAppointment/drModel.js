const mongoose = require('mongoose');

const DrSchema = new mongoose.Schema({
    dId:{type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true  },
    userPhone: { type: String, required: true  },
    doctor: { type: String, required: true  },
    date: { type: String, required: true  },
    token: { type: Number, required: true  },
    department: { type: String, required: true },
    status: { type: String },
  }, { timestamps: true }
);

const DepartmentSchema = new mongoose.Schema({
    doctor: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    startTime: { type: String, required: true },
    totalToken: { type: Number, required: true  },
    currentToken: { type: Number, required: true },
    tokenStatus: { type: Number, required: true },
    drStatus: { type: Boolean,required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
  
module.exports = {
    DrConsultantModal: mongoose.model('DrConsultantModal', DrSchema),
    DepartmentModal: mongoose.model('DepartmentModal', DepartmentSchema),
};

