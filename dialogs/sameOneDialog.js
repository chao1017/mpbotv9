const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { BuyerNameDialog } = require("./buyerDialogs/buyerNameDialog")
const { BuyerPhoneDialog } = require("./buyerDialogs/buyerPhoneDialog")
const { BuyerEmailDialog } = require("./buyerDialogs/buyerEmailDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SAMEONE_PROMPT = "sameonePrompt"
const BUYERNAME_PROMPT = "buyernamePrompt"
const BUYERPHONE_PROMPT = "buyerphonePrompt"
const BUYEREMAIL_PROMPT = "buyeremailPrompt"

class SameOneDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SAMEONE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new BuyerNameDialog(BUYERNAME_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerPhoneDialog(BUYERPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerEmailDialog(BUYEREMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.SameOneStep0.bind(this),
                this.SameOneStep1.bind(this),
                this.SameOneStep2.bind(this),
                this.SameOneStep3.bind(this),
                this.SameOneStep4.bind(this),
                this.SameOneStep5.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async SameOneStep0(stepContext) {
        console.log("SameOneStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var sameone = MessageFactory.suggestedActions(["是", "否"], "收件人同購買人嗎?")
        if (!userInfo.sameToConsignee) {
            return await stepContext.prompt(TEXT_PROMPT, sameone)
        } else {
            return await stepContext.next()
        }
    }

    async SameOneStep1(stepContext) {
        console.log("SameOneStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.sameToConsignee === undefined && stepContext.result) {
            userInfo.sameToConsignee = stepContext.result
        }
        console.log("收件人同購買人: ", userInfo.sameToConsignee)

        switch (userInfo.sameToConsignee) {
            case "是":
                userInfo.buyerName = userInfo.consigneeName
                userInfo.buyerPhone = userInfo.consigneePhone
                userInfo.buyerEmail = userInfo.consigneeEmail
                return await stepContext.endDialog()
            case "否":
                return await stepContext.next()
            default:
                await stepContext.context.sendActivity("麻煩選擇是或否，謝謝")
                userInfo.sameToConsignee = undefined
                return await stepContext.beginDialog(SAMEONE_PROMPT)
        }
    }

    async SameOneStep2(stepContext) {
        console.log("SameOneStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERNAME_PROMPT)
    }

    async SameOneStep3(stepContext) {
        console.log("SameOneStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERPHONE_PROMPT)
    }

    async SameOneStep4(stepContext) {
        console.log("SameOneStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYEREMAIL_PROMPT)
    }

    async SameOneStep5(stepContext) {
        console.log("SameOneStep5")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.endDialog()
    }
}

module.exports.SameOneDialog = SameOneDialog