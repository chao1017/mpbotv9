// 選擇取貨方式
// 並導引至各取貨方式之對話流程

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { HomeDeliveryDialog } = require("./homeDeliveryDialog")

// const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHOWORDER_PROMPT = "showorderPrompt"
const SHIPPINGWAY_PROMPT = "shippingwayPrompt"
const HOMEDELIVERY_PROMPT = "homedeliveryPrompt"

class ShippingWayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor, conversationReferences) {
        super(id || SHIPPINGWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor
        this.conversationReferences = conversationReferences

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new HomeDeliveryDialog(HOMEDELIVERY_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(SHOWORDER_PROMPT, [
                this.ShippingWayStep1.bind(this),
                this.ShippingWayStep2.bind(this),
            ]))

        this.initialDialogId = SHOWORDER_PROMPT
    }

    async ShippingWayStep1(stepContext) {
        console.log("ShippingWayStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.shippingWayList = ["宅配"]
        userInfo.store.shipping_config.forEach(element => {
            switch (element) {
                case "711":
                    userInfo.shippingWayList.push("7-11")
                    break;
                case "family":
                    userInfo.shippingWayList.push("全家")
                    break;
                case "self":
                    userInfo.shippingWayList.push("自取")
                    break;
                default:
                    break;
            }
        });
        const shipWay = MessageFactory.suggestedActions(userInfo.shippingWayList, `請選擇取貨方式`);
        if (!userInfo.shippingWay) {
            return await stepContext.prompt(TEXT_PROMPT, shipWay)
        } else {
            return await stepContext.next()
        }
    }

    async ShippingWayStep2(stepContext) {
        console.log("ShippingWayStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.shippingWay === undefined && stepContext.result) {
            userInfo.shippingWay = stepContext.result
        }
        if (userInfo.shippingWayList.includes(userInfo.shippingWay)) {
            switch (userInfo.shippingWay) {
                case "宅配":
                    return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
                case "7-11":
                    return await stepContext.endDialog()
                case "全家":
                    return await stepContext.endDialog()
                case "自取":
                    userInfo.paymentWay = "自取時付款"
                    return await stepContext.endDialog()
                default:
                    await stepContext.context.sendActivity("麻煩用選的，謝謝。")
                    userInfo.shippingWay = undefined
                    return await stepContext.beginDialog(SHIPPINGWAY_PROMPT)
            }
        } else {
            await stepContext.context.sendActivity("麻煩用選的，謝謝。")
            userInfo.shippingWay = undefined
            return await stepContext.beginDialog(SHIPPINGWAY_PROMPT)
        }
    }
}

module.exports.ShippingWayDialog = ShippingWayDialog