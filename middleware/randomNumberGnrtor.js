const crypto = require('crypto');


function generateOrderNumber() {
    const timestamp = new Date().getTime().toString(36); 
    const randomString = crypto.randomBytes(4).toString('hex').toUpperCase(); 
    return timestamp + '-' + randomString;
}

module.exports = generateOrderNumber;
