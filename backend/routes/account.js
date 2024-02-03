const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require('mongoose');
const router = express.Router();

router.get("/balance",authMiddleware, async (req,res)=>{
    const account = await Account.findOne({
        useId: req.useId
    });

    res.status(200).json({
        balance: account.balance
    });
});

router.post("/transfer", authMiddleware, async(req,res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    //fetching the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance" 
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }
    
    //performing the transation
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount }}).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount }}).session(session);

    //commiting or closing the transaction
    await session.commitTransaction();

    res.status(200).json({
        message: "Transfer successfull"
    });
});

module.exports = router;