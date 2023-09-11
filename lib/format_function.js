
const dayjs = require("dayjs");

function numberDigitFormat(num) {
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function numberFormat(num) {
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function datetimeFormat(date) {
  return dayjs(date).format("DD/MM/YYYY เวลา HH:mm:ss");
}

function dateFormat(date) {
  return dayjs(date).format("DD/MM/YYYY");
}

function getImage(item){
  return "https://drive.google.com/uc?export=view&id=" + item;
}

module.exports = {numberDigitFormat, numberFormat, dateFormat, datetimeFormat, getImage};
