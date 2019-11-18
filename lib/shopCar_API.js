// 呼叫 https://test.mp-boss.com/ajax/payment/shopcart.php 取得購物車資訊

const request = require('request');

module.exports = {
    post_info: function (formdata) {
        return new Promise(function (resolve, reject) {
            request.post({
                url: 'https://test.mp-boss.com/ajax/payment/shopcart.php',
                headers: { 'content-type': 'multipart/form-data' },
                form: formdata
            },
                function (err, response, body) {
                    console.log('error:', err); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', JSON.parse(body)); // Print the HTML for the ReqRes homepage.
                    // console.log('body:', JSON.parse(body).msg); // Print the HTML for the ReqRes homepage.
                    resolve(body)
                });
        })
    },
}
