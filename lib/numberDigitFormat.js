const numberDigitFormat = (num)=>{
    const number = num.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})
    return number;
}

module.exports = numberDigitFormat;