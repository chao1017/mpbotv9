// 讓使用者選擇規格及輸入購買數量
// 並將資訊傳給API

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ShopCar_API = require('../../lib/shopCar_API')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const NUMBER_PROMPT = 'numberPrompt'
const SHOWPRODUCT_PROMPT = "showProductPrompt"
const SHOWSPECIFICATION_PROMPT = "showspecificationPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"
const SHOWORDER_PROMPT = "showorderPrompt"

const VALIDATION_SUCCEEDED = true
const VALIDATION_FAILED = false


class ShowSpecificationDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SHOWSPECIFICATION_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
        this.addDialog(new WaterfallDialog(MAIN_PROMPT, [
            this.showSpecificationStpe1.bind(this),
            this.showSpecificationStpe2.bind(this),
            this.showSpecificationStpe3.bind(this),
        ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async showSpecificationStpe1(stepContext) {
        console.log("showSpecificationStpe1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.specificationList = []
        var specificationItem = []
        Object.keys(userInfo.product.product_detail).map(function (num, index) {
            if (userInfo.product.product_detail[num].product_status == 200) {
                let value = {
                    product_spec1: userInfo.product.product_detail[num].product_spec1,
                    product_price: userInfo.product.product_detail[num].product_price,
                    psid: userInfo.product.product_detail[num].psid,
                }
                specificationItem.push({
                    type: "postBack",
                    title: userInfo.product.product_detail[num].product_spec1 + " $" + userInfo.product.product_detail[num].product_price,
                    value: JSON.stringify(value)
                })
                userInfo.specificationList.push(JSON.stringify(value))
            }
        })
        console.log("create specificationCard")
        const specificationCard = CardFactory.heroCard("", "", [], specificationItem)
        if (!userInfo.choiceSpecification) {
            await stepContext.context.sendActivity({ attachments: [specificationCard] })
            return await stepContext.prompt(TEXT_PROMPT, "請選擇規格")
        } else {
            return await stepContext.next()
        }
    }

    async showSpecificationStpe2(stepContext) {
        console.log("showSpecificationStpe2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choiceSpecification === undefined && stepContext.result) {
            userInfo.choiceSpecification = stepContext.result
            console.log("選擇規格 : ", userInfo.choiceSpecification)
            console.log("specificationList : ", userInfo.specificationList)
        }
        if (userInfo.specificationList.includes(userInfo.choiceSpecification)) {

            var specification = JSON.parse(userInfo.choiceSpecification).product_spec1
            console.log("create quantityCard")
            Object.keys(userInfo.product.product_detail).map(function (num, index) {
                if (specification == userInfo.product.product_detail[num].product_spec1) {
                    if ((userInfo.product.product_detail[num].product_quantity * 1) <= 0) {
                        stepContext.context.sendActivity("此商品庫存不足")
                        stepContext.context.sendActivity("請關閉機器人")
                        return stepContext.cancelAllDialogs()
                    } else {
                        userInfo.quantityList = userInfo.product.product_detail[num].product_quantity * 1
                    }
                }
            })

            console.log("create offercard")
            var productOfferCard
            // console.log(userInfo.product)
            console.log(userInfo.product.product_plan == "")
            console.log(userInfo.product.product_plan == "null")
            console.log(userInfo.product.product_plan == null)
            if ((userInfo.product.product_plan != "") && (userInfo.product.product_plan != null) && (userInfo.product.product_plan != "null")) {
                let productOffers = ""
                userInfo.product.product_plan.forEach(element => {
                    productOffers += (element.product_min + "入以上，優惠價: $" + element.product_price + "\n\n")
                });
                productOfferCard = CardFactory.heroCard("", productOffers, [], [])
                await stepContext.context.sendActivity({ attachments: [productOfferCard] });
            }
            if (!userInfo.choiceQuantity) {
                return await stepContext.prompt(TEXT_PROMPT, "請輸入想要的數量")
            } else {
                return await stepContext.next()
            }
        } else {
            userInfo.choiceSpecification = undefined
            await stepContext.context.sendActivity("如需修改商品相關內容")
            await stepContext.context.sendActivity("可於購物清單中的'修改商品'做修改。")
            await stepContext.context.sendActivity("麻煩點選規格。")
            return await stepContext.beginDialog(SHOWSPECIFICATION_PROMPT)
        }
    }

    async showSpecificationStpe3(stepContext) {
        console.log("showSpecificationStpe3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choiceQuantity === undefined && stepContext.result) {
            userInfo.choiceQuantity = stepContext.result
            console.log("選擇數量 : ", userInfo.choiceQuantity)
        }
        // if (isNaN(userInfo.choiceQuantity * 1) || userInfo.choiceQuantity * 1 <= 0) {
        if (isNaN(userInfo.choiceQuantity)) {
            userInfo.choiceQuantity = undefined
            await stepContext.context.sendActivity("如需修改商品相關內容")
            await stepContext.context.sendActivity("可於購物清單中的'修改商品'做修改。")
            await stepContext.context.sendActivity("麻煩輸入數字。")
            return await stepContext.beginDialog(SHOWSPECIFICATION_PROMPT)
        }
        else {
            // if (userInfo.choiceQuantity * 1 <= userInfo.quantityList * 1 && userInfo.choiceQuantity * 1 > 0) {
            if (userInfo.choiceQuantity * 1 <= userInfo.quantityList * 1) {
                var specification = JSON.parse(userInfo.choiceSpecification).product_spec1
                let formdata
                Object.keys(userInfo.product.product_detail).map(function (num, index) {
                    if (specification == userInfo.product.product_detail[num].product_spec1) {
                        userInfo.productPsid = userInfo.product.product_detail[num].psid
                    }
                })
                formdata = {
                    pid: userInfo.productId,
                    product_psid: userInfo.productPsid,
                    product_quantity: userInfo.choiceQuantity * 1,
                    shopcart_id: userInfo.orderId,
                    shopcart_pw: userInfo.usedPassWord,
                    method: "post",
                    mode: "add"
                }
                console.log("formdata: ", formdata)
                console.log("ShopCar_post start")
                var backvalue
                await ShopCar_API.post_info(formdata).then(function (value) {
                    console.log(`value = ${value}`)
                    console.log("ShopCar_post end")
                    backvalue = value
                })
                // await stepContext.context.sendActivity(`order ID: ${JSON.parse(backvalue).data.order_header.order_id}`)
                if (JSON.parse(backvalue).error == 0) {
                    userInfo.orderData = JSON.parse(backvalue).data
                    userInfo.orderId = JSON.parse(backvalue).data.order_header.order_id
                    userInfo.usedPassWord = JSON.parse(backvalue).data.order_header.used_pw
                } else if (JSON.parse(backvalue).error == 1) {
                    await stepContext.context.sendActivity(`${JSON.parse(backvalue).msg}。`)
                    await stepContext.context.sendActivity("請選擇其他商品")
                    userInfo.choiceSpecification = undefined
                    userInfo.choiceQuantity = undefined
                    return await stepContext.beginDialog(SHOWMORE_PROMPT)
                }
                // console.log("userInfo.orderData :　", userInfo.orderData)
                userInfo.choiceSpecification = undefined
                userInfo.choiceQuantity = undefined
                return await stepContext.beginDialog(SHOWORDER_PROMPT)
            } else if (userInfo.choiceQuantity * 1 > userInfo.quantityList * 1) {
                userInfo.choiceQuantity = undefined
                await stepContext.context.sendActivity(`超過庫存數量，請重新輸入 目前庫存: ${userInfo.quantityList})`)
                return await stepContext.beginDialog(SHOWSPECIFICATION_PROMPT)
            }
        }
    }
}

module.exports.ShowSpecificationDialog = ShowSpecificationDialog