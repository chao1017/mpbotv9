// 若選擇 7-11 取貨方式 則進入此對話 並詢問付款方式

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SEVENELEVENDELIVERYPAYMENTWAY_PROMPT = "sevenelevendeliverypaymentwayPrompt"

const paymentWay_list = ["信用卡", "超商條碼", "超商代碼", "7-11取貨付款"]

class SevenElevenDeliveryPaymentWayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SEVENELEVENDELIVERYPAYMENTWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.SevenElevenDeliveryPaymentWayStep0.bind(this),
                this.SevenElevenDeliveryPaymentWayStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async SevenElevenDeliveryPaymentWayStep0(stepContext) {
        console.log("SevenElevenDeliveryPaymentWayStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var deletList = ["全家取貨付款"]
        deletList.forEach(element => {
            for (var i = 0; i < userInfo.paymentWayList.length; i++) {
                if (userInfo.paymentWayList[i] == element) {
                    userInfo.paymentWayList.splice(i, 1);
                }
            }
        });
        var paymentWay = MessageFactory.suggestedActions(userInfo.paymentWayList, "請選擇付款方式")
        if (!userInfo.paymentWay) {
            return await stepContext.prompt(TEXT_PROMPT, paymentWay)
        } else {
            return await stepContext.next()
        }
    }

    async SevenElevenDeliveryPaymentWayStep1(stepContext) {
        console.log("SevenElevenDeliveryPaymentWayStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.paymentWay === undefined && stepContext.result) {
            userInfo.paymentWay = stepContext.result
        }
        console.log("付款方式: ", userInfo.paymentWay)
        if (userInfo.paymentWayList.includes(userInfo.paymentWay)) {
            return await stepContext.endDialog()
        } else {
            await stepContext.context.sendActivity("用選的OK?")
            await stepContext.context.sendActivity("不要鬧事")
            userInfo.paymentWay = undefined
            return await stepContext.beginDialog(SEVENELEVENDELIVERYPAYMENTWAY_PROMPT)
        }
    }
}

module.exports.SevenElevenDeliveryPaymentWayDialog = SevenElevenDeliveryPaymentWayDialog