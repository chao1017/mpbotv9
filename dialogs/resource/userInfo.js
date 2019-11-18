// 每位使用者進入都會產生一個專屬的UserInfo
// 有需要新增刪除使用者儲存資訊皆從此處

class UserInfo {
    constructor(
        noneImage,
        botId, userId, conversationId, productId, originProductId,
        productIdList,
        product, productDetail, productImage, productSizeImage, productPsid, specificationList, quantityList,
        choiceSpecification, choiceQuantity,
        store,
        choice,
        orderData, orderId, usedPassWord, orderchange,
        shippingWay, shippingWayList, district, city, areaData, area, zipCode, otherAddr,
        consigneeName, consigneePhone, consigneeEmail,
        sameToConsignee,
        buyerName, buyerPhone, buyerEmail,
        paymentWay, paymentWayList,
        postData,
    ) {
        this.noneImage = noneImage || "https://i.imgur.com/QfZ13jr.jpg";
        this.botId = botId || undefined;
        this.userId = userId || undefined;
        this.conversationId = conversationId || undefined;
        this.productId = productId || undefined;
        this.originProductId = originProductId || undefined;
        this.productIdList = productIdList || [];
        this.product = product || undefined;
        this.productDetail = productDetail || undefined;
        this.productImage = productImage || undefined;
        this.productSizeImage = productSizeImage || undefined;
        this.productPsid = productPsid || undefined;
        this.specificationList = specificationList || undefined;
        this.quantityList = quantityList || undefined;
        this.choiceSpecification = choiceSpecification || undefined;
        this.choiceQuantity = choiceQuantity || undefined;
        this.store = store || undefined;
        this.choice = choice || undefined;
        this.orderData = orderData || undefined;
        this.orderId = orderId || undefined;
        this.usedPassWord = usedPassWord || undefined;
        this.orderchange = orderchange || undefined;
        this.shippingWay = shippingWay || undefined;
        this.shippingWayList = shippingWayList || undefined;
        this.district = district || undefined;
        this.city = city || undefined;
        this.areaData = areaData || undefined;
        this.area = area || undefined;
        this.zipCode = zipCode || undefined;
        this.otherAddr = otherAddr || undefined;
        this.consigneeName = consigneeName || undefined;
        this.consigneePhone = consigneePhone || undefined;
        this.consigneeEmail = consigneeEmail || undefined;
        this.sameToConsignee = sameToConsignee || undefined;
        this.buyerName = buyerName || undefined;
        this.buyerPhone = buyerPhone || undefined;
        this.buyerEmail = buyerEmail || undefined;
        this.paymentWay = paymentWay || undefined;
        this.paymentWayList = paymentWayList || undefined;
        this.postData = postData || undefined;
    }
}

exports.UserInfo = UserInfo;
