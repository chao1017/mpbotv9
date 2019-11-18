// 讓使用者輸入修改的數量
// 並將結果傳給API

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ShopCar_API = require('../../lib/shopCar_API')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = "textprompt"
const MODIFY_PROMPT = "modifyprompt"
const SHOWORDER_PROMPT = "showorderPrompt"


class ModifyProductDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || MODIFY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.DeleteProductStep1.bind(this),
                this.DeleteProductStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async DeleteProductStep1(stepContext) {
        console.log("DeleteProductStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.choice) {
            return await stepContext.prompt(TEXT_PROMPT, "請輸入想要的數量")
        } else {
            return await stepContext.next()
        }
    }

    async DeleteProductStep2(stepContext) {
        console.log("DeleteProductStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choice === undefined && stepContext.result) {
            userInfo.choice = stepContext.result
            console.log("想要的數量 :　", userInfo.choice)
        }
        if (isNaN(userInfo.choice * 1) || userInfo.choice * 1 <= 0) {
        // if (isNaN(userInfo.choice * 1) || userInfo.choice * 1 <= 0) {
            await stepContext.context.sendActivity("是要不要改數量")
            userInfo.choice = undefined
            return await stepContext.beginDialog(MODIFY_PROMPT)
        } else {
            var formdata = {
                pid: JSON.parse(userInfo.orderchange).pid,
                product_psid: JSON.parse(userInfo.orderchange).psid,
                product_quantity: userInfo.choice,
                shopcart_id: userInfo.orderId,
                shopcart_pw: userInfo.usedPassWord,
                method: "post",
                // mode: "add"
            }
            var backvalue
            await ShopCar_API.post_info(formdata).then(function (value) {
                console.log("ShopCar_post end")
                backvalue = value
            })
            // console.log("userInfo.orderData: ", backvalue)
            if (JSON.parse(backvalue).error == 0) {
                // console.log(JSON.parse(backvalue).data.order_detail)
                if (JSON.parse(backvalue).data.order_detail.length == 0) {
                    userInfo.orderData = undefined
                    await stepContext.context.sendActivity("購物車是空的喔")
                    await stepContext.context.sendActivity("請選購商品~")
                    userInfo.orderchange = undefined
                    userInfo.choice = undefined
                    return await stepContext.beginDialog(SHOWMORE_PROMPT)
                } else {
                    userInfo.orderData = JSON.parse(backvalue).data
                    userInfo.orderId = JSON.parse(backvalue).data.order_header.order_id
                    userInfo.usedPassWord = JSON.parse(backvalue).data.order_header.used_pw
                }
            } else if (JSON.parse(backvalue).error == 1) {
                await stepContext.context.sendActivity("發生錯誤，請重新開啟機器人。")
                return await stepContext.cancelAllDialogs()
            }
            userInfo.orderchange = undefined
            userInfo.choice = undefined
            return await stepContext.beginDialog(SHOWORDER_PROMPT)
        }
    }
}

module.exports.ModifyProductDialog = ModifyProductDialog