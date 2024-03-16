const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'purchase', 'refund'], required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    
});

const Transaction = mongoose.model('WalletTransaction', transactionSchema);

module.exports = Transaction;
