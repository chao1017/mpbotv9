// 修改購買資訊 將依照點選內容前往專屬對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { BuyerNameDialog } = require("../buyerDialogs/buyerNameDialog")
const { BuyerPhoneDialog } = require("../buyerDialogs/buyerPhoneDialog")
const { BuyerEmailDialog } = require("../buyerDialogs/buyerEmailDialog")

const MAIN_PROMPT = "mainPrompt"
const CUSER_PROMPT = "cuserPrompt"
const BUSER_PROMPT = "buserPrompt"
const TEXT_PROMPT = 'textPrompt'

const CHANGE_PROMPT = "changePrompt"
const SHOWORDER_PROMPT = "showorderPrompt"

const CONSIGNEENAME_PROMPT = "consigneenamePrompt"
const CONSIGNEEPHONE_PROMPT = "consigneephonePrompt"
const CONSIGNEEEMAIL_PROMPT = "consigneeemailPrompt"
const BUYERNAME_PROMPT = "buyernamePrompt"
const BUYERPHONE_PROMPT = "buyerphonePrompt"
const BUYEREMAIL_PROMPT = "buyeremailPrompt"
const SHIPPINGWAY_PROMPT = "shippingwayPrompt"
const PAYMENTWAY_PROMPT = "paymentwayPrompt"

class ChangeDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CHANGE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new BuyerNameDialog(BUYERNAME_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerPhoneDialog(BUYERPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerEmailDialog(BUYEREMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ChangeStep0.bind(this),
                this.ChangeStep1.bind(this),
                this.ChangeStep2.bind(this),
            ]))
            .addDialog(new WaterfallDialog(CUSER_PROMPT, [
                this.CNameStep0.bind(this),
                this.CNameStep1.bind(this),
                this.CNameStep2.bind(this),
            ]))
            .addDialog(new WaterfallDialog(BUSER_PROMPT, [
                this.BNameStep0.bind(this),
                this.BNameStep1.bind(this),
                this.BNameStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ChangeStep0(stepContext) {
        console.log("ChangeStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.choice = undefined
        var change
        if (userInfo.shippingWay == "自取") {
            change = MessageFactory.suggestedActions(["修改收件人資訊", "修改購買人資訊", "修改取貨方式"])
        } else {
            change = MessageFactory.suggestedActions(["修改收件人資訊", "修改購買人資訊", "修改取貨方式", "修改付款方式"])
        }
        if (!userInfo.choice) {
            return await stepContext.prompt(TEXT_PROMPT, change)
        } else {
            return await stepContext.next()
        }
    }

    async ChangeStep1(stepContext) {
        console.log("ChangeStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choice === undefined && stepContext.result) {
            userInfo.choice = stepContext.result
        }
        console.log("userInfo.choice: ", userInfo.choice)
        switch (userInfo.choice) {
            case "修改收件人資訊":
                userInfo.choice = undefined
                userInfo.consigneeName = undefined
                userInfo.consigneePhone = undefined
                userInfo.consigneeEmail = undefined
                return await stepContext.beginDialog(CUSER_PROMPT)
            case "修改購買人資訊":
                userInfo.choice = undefined
                userInfo.buyerName = undefined
                userInfo.buyerPhone = undefined
                userInfo.buyerEmail = undefined
                return await stepContext.beginDialog(BUSER_PROMPT)
            case "修改取貨方式":
                if (userInfo.shippingWay == "自取") {
                    userInfo.paymentWay = undefined
                }
                userInfo.choice = undefined
                userInfo.shippingWay = undefined
                userInfo.shippingWayList = undefined
                userInfo.district = undefined
                userInfo.city = undefined
                userInfo.areaData = undefined
                userInfo.area = undefined
                userInfo.zipCode = undefined
                userInfo.otherAddr = undefined
                return await stepContext.beginDialog(SHIPPINGWAY_PROMPT)
            case "修改付款方式":
                userInfo.choice = undefined
                userInfo.paymentWay = undefined
                userInfo.paymentWayList = undefined
                return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
            default:
                await stepContext.context.sendActivity("拜託用選的OK?")
                userInfo.choice = undefined
                return await stepContext.beginDialog(CHANGE_PROMPT)
        }
    }

    async ChangeStep2(stepContext) {
        console.log("ChangeStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(SHOWORDER_PROMPT)
    }

    async CNameStep0(stepContext) {
        console.log("CNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEENAME_PROMPT)
    }

    async CNameStep1(stepContext) {
        console.log("CNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEPHONE_PROMPT)
    }

    async CNameStep2(stepContext) {
        console.log("CNameStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEEMAIL_PROMPT)
    }

    async BNameStep0(stepContext) {
        console.log("BNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERNAME_PROMPT)
    }

    async BNameStep1(stepContext) {
        console.log("BNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERPHONE_PROMPT)
    }

    async BNameStep2(stepContext) {
        console.log("BNameStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYEREMAIL_PROMPT)
    }
}

module.exports.ChangeDialog = ChangeDialog