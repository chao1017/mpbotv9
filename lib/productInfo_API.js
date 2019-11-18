// 呼叫 https://test.mp-boss.com/api/mpboss/product.php?method=get&pid=50          取得該商品資訊
// 呼叫 https://test.mp-boss.com/api/mpboss/product.php?method=get_more_new&pid=50&page=1&limit=9&filter_pid= 取得更多商品資訊

const request = require('request');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
    catch_info: function (pid) {
        return new Promise(function (resolve, reject) {
            request.post({
                url: 'https://test.mp-boss.com/api/mpboss/product.php?method=get&pid=' + pid,
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
    catch_more: function (pid) {
        return new Promise(function (resolve, reject) {
            request.post({
                url: 'https://test.mp-boss.com/api/mpboss/product.php?method=get_more_new&pid=' + pid + '&page=1&limit=9&filter_pid=',
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