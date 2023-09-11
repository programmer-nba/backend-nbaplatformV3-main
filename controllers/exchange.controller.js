const axios = require('axios');

module.exports.Exchange = async (req, res) => {
    try {
        let data = {
            tel: req.user.tel,
            item_id: req.body.item_id,
        };
        console.log('useruseruser', data)

        const exchangeRequestConfig = {
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/exchangepoint/exchange`,
            data: data
        };
        const exchangeResponse = await axios.post(exchangeRequestConfig.url, data, {
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        console.log(exchangeResponse.data);

        return res.status(200).send(exchangeResponse.data);
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    }
}