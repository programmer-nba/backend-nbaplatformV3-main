const {MoneySavings}= require('../../models/money.savings.model')

exports.getProfit = async(req, res)=>{
    try{
        const savings = await MoneySavings.find();
        const nba_profit = savings.reduce((sum, el)=>sum+el.nba_profit, 0);
        const allsale = savings.reduce((sum, el)=>sum+el.allsale, 0);
        const central = savings.reduce((sum, el)=>sum+el.central, 0);
        const emp_bonus = savings.reduce((sum, el)=> sum+el.emp_bonus, 0);
        
        const res_data = {
            nba_profit : nba_profit,
            central : central,
            allsale : allsale,
            emp_bonus : emp_bonus
        }
        
        return res.status(200).send({status: true, data:res_data})
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message :'มีบางอย่างผิดพลาด'})
    }
}