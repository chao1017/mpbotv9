// 呼叫API刪除使用者所選擇的商品
// 如刪除完購物車內沒有商品將會引導至更多商品對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ShopCar_API = require('../../lib/shopCar_API')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = "textprompt"
const DELETE_PROMPT = "deleteprompt"
const SHOWORDER_PROMPT = "showorderPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"


class DeleteProductDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || DELETE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.DeleteProductStep1.bind(this),
                this.DeleteProductStep2.bind(this),
                this.DeleteProductStep3.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async DeleteProductStep1(stepContext) {
        console.log("DeleteProductStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var choice = MessageFactory.suggestedActions(["是", "否"], "確定刪除嗎?")
        if (!userInfo.choice) {
            return await stepContext.prompt(TEXT_PROMPT, choice)
        } else {
            return await stepContext.next()
        }
    }

    async DeleteProductStep2(stepContext) {
        console.log("DeleteProductStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choice === undefined && stepContext.result) {
            userInfo.choice = stepContext.result
            console.log("是否刪除 :　", userInfo.choice)
        }
        switch (userInfo.choice) {
            case "是":
                userInfo.choice = undefined
                return stepContext.next()
            case "否":
                userInfo.choice = undefined
                return stepContext.beginDialog(SHOWORDER_PROMPT)
            default:
                userInfo.choice = undefined
                stepContext.context.sendActivity("到底要幹嘛哩")
                return stepContext.beginDialog(DELETE_PROMPT)
        }
    }

    async DeleteProductStep3(stepContext) {
        console.log("DeleteProductStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var formdata = {
            pid: JSON.parse(userInfo.orderchange).pid,
            product_psid: JSON.parse(userInfo.orderchange).psid,
            product_quantity: 0,
            shopcart_id: userInfo.orderId,
            shopcart_pw: userInfo.usedPassWord,
            method: "post",
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
        return await stepContext.beginDialog(SHOWORDER_PROMPT)
    }
}

module.exports.DeleteProductDialog = DeleteProductDialog