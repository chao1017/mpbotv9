// 依照所選取貨方式進入各自專屬對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { HomeDeliveryPaymentWayDialog } = require("./homeDeliveryPaymentWayDialog")
const { SevenElevenDeliveryPaymentWayDialog } = require("./sevenElevenDeliveryPaymentWayDialog")
const { HomeFamilyDeliveryPaymentWayDialog } = require("./homeFamilyDeliveryPaymentWayDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const PAYMENTWAY_PROMPT = "paymentwayPrompt"
const HOMEDELIVERYPAYMENTWAY_PROMPT = "homedeliverypaymentwayPrompt"
const SEVENELEVENDELIVERYPAYMENTWAY_PROMPT = "sevenelevendeliverypaymentwayPrompt"
const HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT = "homefamilydeliverypaymentwayPrompt"
class PaymentWayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || PAYMENTWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new HomeDeliveryPaymentWayDialog(HOMEDELIVERYPAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new SevenElevenDeliveryPaymentWayDialog(SEVENELEVENDELIVERYPAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new HomeFamilyDeliveryPaymentWayDialog(HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.PaymentWayStep0.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async PaymentWayStep0(stepContext) {
        console.log("PaymentWayStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.paymentWayList = ["信用卡"]
        userInfo.store.payment_config.forEach(element => {
            switch (element) {
                case "120":
                    userInfo.paymentWayList.push("超商條碼")
                    break;
                case "130":
                    userInfo.paymentWayList.push("超商代碼")
                    break;
                case "140":
                    userInfo.paymentWayList.push("ATM轉帳")
                    break;
                case "200":
                    userInfo.paymentWayList.push("7-11取貨付款")
                    break;
                case "400":
                    userInfo.paymentWayList.push("全家取貨付款")
                    break;
                default:
                    break;
            }
        });
        switch (userInfo.shippingWay) {
            case "宅配":
                return await stepContext.beginDialog(HOMEDELIVERYPAYMENTWAY_PROMPT)
            case "7-11":
                return await stepContext.beginDialog(SEVENELEVENDELIVERYPAYMENTWAY_PROMPT)
            case "全家":
                return await stepContext.beginDialog(HOMEFAMILYDELIVERYPAYMENTWAY_PROMPT)
            case "自取":
                return await stepContext.endDialog()
            default:
                return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
        }
    }
}

module.exports.PaymentWayDialog = PaymentWayDialog