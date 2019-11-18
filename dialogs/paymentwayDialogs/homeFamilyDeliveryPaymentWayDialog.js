// 若選擇 宅配 取貨方式 則進入此對話 並詢問付款方式

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT = "homefamilydeliverypaymentwayPrompt"

const paymentWay_list = ["信用卡", "超商條碼", "超商代碼", "全家取貨付款"]

class HomeFamilyDeliveryPaymentWayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.HomeFamilyDeliveryPaymentWayStep0.bind(this),
                this.HomeFamilyDeliveryPaymentWayStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async HomeFamilyDeliveryPaymentWayStep0(stepContext) {
        console.log("HomeFamilyDeliveryPaymentWayStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var deletList = ["7-11取貨付款"]
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

    async HomeFamilyDeliveryPaymentWayStep1(stepContext) {
        console.log("HomeFamilyDeliveryPaymentWayStep1")
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
            return await stepContext.beginDialog(HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT)
        }
    }
}

module.exports.HomeFamilyDeliveryPaymentWayDialog = HomeFamilyDeliveryPaymentWayDialog