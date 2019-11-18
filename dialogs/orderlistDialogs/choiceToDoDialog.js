// 讓使用者選擇下一步動作
// 依照動作不同前往各自專屬對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ShowMoreDialog } = require("../productDialogs/showMoreDialog")
const { ChangeDialog } = require("./changeDialog")
const { ConfirmPaymentDialog } = require("../paymentDialogs/confirmPaymentDialog")
const { DecideDialog } = require("../modifyProductDialogs/decideDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const CHOICETODO_PROMPT = "choicetodoPrompt"
const MAINPROUCT_PROMPT = "mainproductPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"
const CHANGE_PROMPT = "changePrompt"
const CONFIRMPAYMENT_PROMPT = "confirmpaymentPrompt"
const DECIDE_PROMPT = "decideprompt"

class ChoiceToDoDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CHOICETODO_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ShowMoreDialog(SHOWMORE_PROMPT, this.userProfileAccessor))
            .addDialog(new ChangeDialog(CHANGE_PROMPT, this.userProfileAccessor))
            .addDialog(new ConfirmPaymentDialog(CONFIRMPAYMENT_PROMPT, this.userProfileAccessor))
            .addDialog(new DecideDialog(DECIDE_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ChoiceToDoStep1.bind(this),
                this.ChoiceToDoStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ChoiceToDoStep1(stepContext) {
        console.log("ChoiceToDoStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.choice = undefined
        var choiceList
        if (userInfo.shippingWay != undefined) {
            choiceList = ["確認付款", "修改購買資訊"]
        } else {
            choiceList = ["結帳", "修改商品", "更多商品", "繼續購買原商品"]
        }
        const choice = MessageFactory.suggestedActions(choiceList)
        if (!userInfo.choice) {
            return await stepContext.prompt(TEXT_PROMPT, choice)
        } else {
            return await stepContext.next()
        }
    }

    async ChoiceToDoStep2(stepContext) {
        console.log("ChoiceToDoStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choice === undefined && stepContext.result) {
            userInfo.choice = stepContext.result
        }
        console.log("動作: ", userInfo.choice)

        if (userInfo.shippingWay != undefined) {
            switch (userInfo.choice) {
                case "確認付款":
                    userInfo.choice = undefined
                    return await stepContext.beginDialog(CONFIRMPAYMENT_PROMPT)
                case "修改購買資訊":
                    // await stepContext.context.sendActivity("還沒實裝")
                    return await stepContext.beginDialog(CHANGE_PROMPT)
                    // return await stepContext.endDialog()
                default:
                    await stepContext.context.sendActivity("還敢不選阿")
                    userInfo.choice = undefined
                    await stepContext.context.sendActivities([
                        { type: 'typing' },
                        { type: 'delay', value: 1000 }
                    ]);
                    return await stepContext.beginDialog(CHOICETODO_PROMPT)
            }
        } else {
            switch (userInfo.choice) {
                case "結帳":
                    userInfo.choice = undefined
                    return await stepContext.endDialog()
                case "修改商品":
                    userInfo.choice = undefined
                    return await stepContext.replaceDialog(DECIDE_PROMPT)
                case "更多商品":
                    userInfo.choice = undefined
                    return await stepContext.beginDialog(SHOWMORE_PROMPT)
                // return await stepContext.endDialog()
                case "繼續購買原商品":
                    userInfo.choice = undefined
                    return await stepContext.beginDialog(MAINPROUCT_PROMPT)
                default:
                    await stepContext.context.sendActivity("還敢不選阿")
                    userInfo.choice = undefined
                    await stepContext.context.sendActivities([
                        { type: 'typing' },
                        { type: 'delay', value: 1000 }
                    ]);
                    return await stepContext.beginDialog(CHOICETODO_PROMPT)
            }
        }
    }
}

module.exports.ChoiceToDoDialog = ChoiceToDoDialog