const axios = require('axios');
const CryptoJs = require('crypto-js')
const { Member } = require('../../models/member.model')
const { WalletHistory } = require("../../models/wallet.history.model");

module.exports.GetAll = async (req, res) => {
    try {
        const id = req.params.id
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/orderservice/list/${id}`,
        }
        await axios(request).then(async (response) => {
            console.log(response)
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}

module.exports.GetCanceledOrder = async (req, res) => {
    try {
        console.log(req.body.tel)
        // Decrypt the payload using the same key used for encryption
        const bytes = CryptoJs.AES.decrypt(req.body.payload, process.env.API_GIVE_COMMISSION);
        const decryptedData = bytes.toString(CryptoJs.enc.Utf8);
        const canceledOrderData = JSON.parse(decryptedData);

        const member = await Member.findOne({ tel: req.body.tel })
        member.wallet += canceledOrderData.refund_amount
        await member.save()

        // create money history
        const wallet_history = new WalletHistory({
            mem_id: member._id,
            name: `คืนเงินจากการยกเลิกใบเสร็จเลขที่: ${canceledOrderData.receiptnumber}`,
            type: "เงินเข้า",
            amount: canceledOrderData.refund_amount,
            detail: canceledOrderData,
        })

        await wallet_history.save()

        return res.status(200).send({ message: 'Received and processed the payload successfully', data: wallet_history });
      } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error while processing the payload', error: error.message });
      }
}