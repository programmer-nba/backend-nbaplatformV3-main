const jwt = require("jsonwebtoken");
const { WalletHistory } = require('../models/wallet.history.model');
const { Member } = require("../models/member.model");

// get All history
module.exports.GetAll = async (req, res) => {

    try {
        const wallethistorydata = await WalletHistory.find();

        return res.status(200).send({
            status: true,
            message: 'ดึงข้อมูลสำเร็จ',
            data: wallethistorydata
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "มีบางอย่างผิดพลาด",
            error: 'server side error'
        });
    }
};

// get history by ID
module.exports.GetById = async (req, res) => {

    const token = req.headers["token"];
    console.log(req.user)

    if (!token) {
        return res.status(401).send({
            status: false,
            message: "Access token missing. Unauthorized request.",
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const member = await Member.findById(decoded._id);

        if (!member) {
            return res.status(404).send({
                status: false,
                message: "Member not found.",
                data: null
            });
        }

        const wallethistorydata = await WalletHistory.find({ mem_id:member._id });

        if (!wallethistorydata) {
            return res.status(404).send({
                status: false,
                message: "Wallet history data not found for the requested ID.",
                data: null
            });
        }

        return res.status(200).send({
            status: true,
            message: 'ดึงข้อมูลสำเร็จ',
            data: wallethistorydata
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "มีบางอย่างผิดพลาด",
            error: 'server side error'
        });
    }
};
