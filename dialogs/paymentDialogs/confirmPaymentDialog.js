// 使用者點擊結帳後進入此對話
// 呼叫API取得結帳資訊
// 並生成按鈕讓使用者點選

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const PayMent_API = require("../../lib/payment_API")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const CONFIRMPAYMENT_PROMPT = "confirmpaymentPrompt"

class ConfirmPaymentDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CONFIRMPAYMENT_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ConfirmPaymentStep0.bind(this),
                this.ConfirmPaymentStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ConfirmPaymentStep0(stepContext) {
        console.log("ConfirmPaymentStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        await PayMent_API.post(userInfo).then(function (value) {
            if (JSON.parse(value).error * 1 == 0) {
                userInfo.postData = JSON.parse(value).data
            } 
            else {
                userInfo.postData = null
            }
        })
        console.log("userInfo.postData : ", userInfo.postData)
        if (userInfo.postData != null) {
            await stepContext.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 1000 }
            ]);
            await stepContext.context.sendActivity("非常感謝您的光臨")
            return await stepContext.next()
        } else {
            await stepContext.context.sendActivity("發生異常狀況，請關閉機器人。")
            return await stepContext.endDialog()
        }
    }

    async ConfirmPaymentStep1(stepContext) {
        console.log("ConfirmPaymentStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("userInfo.botId : ", userInfo.botId)
        console.log("userInfo.userId : ", userInfo.userId)
        console.log("userInfo.conversationId : ", userInfo.conversationId)
        console.log("userInfo.postData : ", userInfo.postData)
        // await stepContext.context.sendActivity(`userInfo.userId: ${userInfo.userId}`)
        // await stepContext.context.sendActivity(`userInfo.botId: ${userInfo.botId}`)
        // await stepContext.context.sendActivity(`userInfo.conversationId: ${userInfo.conversationId}`)
        // await stepContext.context.sendActivity(`userInfo.postData: ${userInfo.postData}`)
        await stepContext.context.sendActivity("點擊按鈕，前往付款畫面。")
        const gopaymentCard = CardFactory.heroCard("", [], [
            {
                type: "openUrl",
                title: '前往付款畫面',
                value: "https://mpbot9527.azurewebsites.net/api/payment?cid=" + userInfo.conversationId + "&uid=" + userInfo.userId
            }])
        await stepContext.context.sendActivity({ attachments: [gopaymentCard] })
        await stepContext.context.sendActivity("可以關閉機器人了，感謝您。")
        // await stepContext.context.sendActivity(`顯示2: ${JSON.parse(userInfo.sun).data}`)
        return await stepContext.endDialog()
    }
    // https://mpbot9527.azurewebsites.net
    // http://localhost:3978
}
module.exports.ConfirmPaymentDialog = ConfirmPaymentDialog