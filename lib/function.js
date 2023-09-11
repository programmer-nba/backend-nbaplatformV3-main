const vat3percent = (num) => {
    const vat = (num*3)/100;
    const amount = num-vat;
    const total = {
        amount : amount,    //ยอดที่หัก vat เรียบร้อยแล้ว
        vat : vat           //ยอดvat ที่หาได้
    }
    return total;
}



module.exports = vat3percent;