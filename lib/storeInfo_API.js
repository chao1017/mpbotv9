// 呼叫 https://test.mp-boss.com/api/mpboss/mpstore.php?method=get&id= + mp_store_id 取的商家資訊

const request = require('request');

module.exports = {
    catch_info: function (mp_store_id) {
        return new Promise(function (resolve, reject) {
            request.post({
                url: 'https://test.mp-boss.com/api/mpboss/mpstore.php?method=get&id=' + mp_store_id,
            },
                function (err, response, body) {
                    console.log('error:', err); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the ReqRes homepage.
                    // console.log('body:', JSON.parse(body).error); // Print the HTML for the ReqRes homepage.
                    // console.log('body:', JSON.parse(body).msg); // Print the HTML for the ReqRes homepage.
                    resolve(body)
                });
        })
    },
}
