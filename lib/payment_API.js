// 呼叫 http://test.mp-boss.com/ajax/payment/trade.php 取得結帳資料

const request = require("request")

function checkPaymentWay(userInfo) {
    var payMentCode
    console.log("userInfo.paymentWay ", userInfo.paymentWay)
    switch (userInfo.paymentWay) {
        case "信用卡":
            payMentCode = 110
            return payMentCode
        case "超商條碼":
            payMentCode = 120
            return payMentCode
        case "超商代碼":
            payMentCode = 130
            return payMentCode
        case "ATM轉帳":
            payMentCode = 140
            return payMentCode
        case "7-11取貨付款":
            payMentCode = 200
            return payMentCode
        case "全家取貨付款":
            payMentCode = 400
            return payMentCode
        case "自取時付款":
            payMentCode = 50
            return payMentCode
        default:
            break;
    }
}

function checkShippingWay(userInfo) {
    var ShippingCode
    console.log("userInfo.shippingWay ", userInfo.shippingWay)
    switch (userInfo.shippingWay) {
        case "宅配":
            ShippingCode = 10
            return ShippingCode
        case "7-11":
            ShippingCode = 100
            return ShippingCode
        case "全家":
            ShippingCode = 300
            return ShippingCode
        case "自取":
            ShippingCode = 50
            return ShippingCode
        default:
            break;
    }
}

function checkProductShipping(userInfo) {
    var product_shipping
    console.log("userInfo.shippingWay ", userInfo.shippingWay)
    switch (userInfo.shippingWay) {
        case "宅配":
            product_shipping = "home"
            return product_shipping
        case "7-11":
            product_shipping = "711"
            return product_shipping
        case "全家":
            product_shipping = "family"
            return product_shipping
        case "自取":
            product_shipping = "self"
            return product_shipping
        default:
            break;
    }
}

function createData_home(userInfo) {
    let d_h = {}
    let l = findFormat(userInfo)
    let pw = checkPaymentWay(userInfo)
    d_h.app = "bot"
    d_h.pid = userInfo.productId
    d_h.product_plan = userInfo.p_combined
    for (let index = 0; index < (userInfo.p_combined * 1); index++) {
        var s = "product_plan_set_" + index.toString()
        if (userInfo.p.product_no_spec == 1) {
            d_h[s] = l[0]
        } else {
            d_h[s] = l[index]
        }
    }
    d_h.shipping_way = 10
    d_h.county = userInfo.city
    d_h.district = userInfo.area
    d_h.zipcode = userInfo.zipCode
    d_h.address = userInfo.otherAddr
    d_h.consignee_name = userInfo.consigneeName
    d_h.consignee_phone = userInfo.consigneePhone
    d_h.consignee_email = userInfo.consigneeEmail
    d_h.buyer_name = userInfo.buyerName
    d_h.buyer_phone = userInfo.buyerPhone
    d_h.buyer_email = userInfo.buyerEmail
    d_h.payment_way = pw
    d_h.method = "post"
    return d_h
}

function createData_home(userInfo) {
    var data = {}
    var product_shipping = checkProductShipping(userInfo)
    var payMentCode = checkPaymentWay(userInfo)
    var ShippingCode = checkShippingWay(userInfo)
    data.mp_store_id = userInfo.orderData.mp_store.mp_store_id
    data.shopcart_id = userInfo.orderId
    data.shopcart_pw = userInfo.usedPassWord
    data.product_shipping = product_shipping
    data.county = userInfo.city
    data.district = userInfo.area
    data.zipcode = userInfo.zipCode
    data.address = userInfo.otherAddr
    data.consignee_name = userInfo.consigneeName
    data.consignee_phone = userInfo.consigneePhone
    data.consignee_email = userInfo.consigneeEmail
    data.buyer_name = userInfo.buyerName
    data.buyer_phone = userInfo.buyerPhone
    data.buyer_email = userInfo.buyerEmail
    data.momo = ""
    data.payment_way = payMentCode
    data.shipping_way = ShippingCode
    data.method = "post"
    return data
}

function createData_711(userInfo) {
    var data = {}
    var product_shipping = checkProductShipping(userInfo)
    var payMentCode = checkPaymentWay(userInfo)
    var ShippingCode = checkShippingWay(userInfo)
    data.mp_store_id = userInfo.orderData.mp_store.mp_store_id
    data.shopcart_id = userInfo.orderId
    data.shopcart_pw = userInfo.usedPassWord
    data.product_shipping = product_shipping
    data.county = ""
    data.district = ""
    data.zipcode = ""
    data.address = ""
    data.consignee_name = userInfo.consigneeName
    data.consignee_phone = userInfo.consigneePhone
    data.consignee_email = userInfo.consigneeEmail
    data.buyer_name = userInfo.buyerName
    data.buyer_phone = userInfo.buyerPhone
    data.buyer_email = userInfo.buyerEmail
    data.momo = ""
    data.payment_way = payMentCode
    data.shipping_way = ShippingCode
    data.method = "post"
    return data
}

function createData_family(userInfo) {
    var data = {}
    var product_shipping = checkProductShipping(userInfo)
    var payMentCode = checkPaymentWay(userInfo)
    var ShippingCode = checkShippingWay(userInfo)
    data.mp_store_id = userInfo.orderData.mp_store.mp_store_id
    data.shopcart_id = userInfo.orderId
    data.shopcart_pw = userInfo.usedPassWord
    data.product_shipping = product_shipping
    data.county = ""
    data.district = ""
    data.zipcode = ""
    data.address = ""
    data.consignee_name = userInfo.consigneeName
    data.consignee_phone = userInfo.consigneePhone
    data.consignee_email = userInfo.consigneeEmail
    data.buyer_name = userInfo.buyerName
    data.buyer_phone = userInfo.buyerPhone
    data.buyer_email = userInfo.buyerEmail
    data.momo = ""
    data.payment_way = payMentCode
    data.shipping_way = ShippingCode
    data.method = "post"
    return data
}

function createData_self(userInfo) {
    var data = {}
    var product_shipping = checkProductShipping(userInfo)
    var payMentCode = checkPaymentWay(userInfo)
    var ShippingCode = checkShippingWay(userInfo)
    data.mp_store_id = userInfo.orderData.mp_store.mp_store_id
    data.shopcart_id = userInfo.orderId
    data.shopcart_pw = userInfo.usedPassWord
    data.product_shipping = product_shipping
    data.county = ""
    data.district = ""
    data.zipcode = ""
    data.address = ""
    data.consignee_name = userInfo.consigneeName
    data.consignee_phone = userInfo.consigneePhone
    data.consignee_email = userInfo.consigneeEmail
    data.buyer_name = userInfo.buyerName
    data.buyer_phone = userInfo.buyerPhone
    data.buyer_email = userInfo.buyerEmail
    data.momo = ""
    data.payment_way = payMentCode
    data.shipping_way = ShippingCode
    data.method = "post"
    return data
}


module.exports = {
    post: function (userInfo) {
        return new Promise(function (resolve, reject) {
            console.log("post")
            if (userInfo.shippingWay == "宅配") {
                var postData = createData_home(userInfo)
            } else if (userInfo.shippingWay == "7-11") {
                var postData = createData_711(userInfo)
            } else if (userInfo.shippingWay == "全家") {
                var postData = createData_family(userInfo)
            } else if (userInfo.shippingWay == "自取") {
                var postData = createData_self(userInfo)
            }
            console.log("postData : ", postData)
            request.post({
                url: 'http://test.mp-boss.com/ajax/payment/trade.php',
                headers: { 'content-type': 'multipart/form-data' },
                form: postData
            },
                function (err, response, body) {
                    // console.log('error:', err); // Print the error if one occurred
                    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the ReqRes homepage.
                    console.log('body:', JSON.parse(body)); // Print the HTML for the ReqRes homepage.
                    console.log('error:', JSON.parse(body).error); // Print the HTML for the ReqRes homepage.
                    console.log('msg:', JSON.parse(body).msg); // Print the HTML for the ReqRes homepage.
                    resolve(body)
                }
            );
        })
    },
}
