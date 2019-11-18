// 取得購買人電話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const PHONE_PROMPT = "phonePrompt"
const BUYERPHONE_PROMPT = "buyerphonePrompt"

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

class BuyerPhoneDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || BUYERPHONE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(PHONE_PROMPT, this.validatePhone))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.BuyerPhoneStep0.bind(this),
                this.BuyerPhoneStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async BuyerPhoneStep0(stepContext) {
        console.log("BuyerPhoneStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.buyerPhone) {
            return await stepContext.prompt(PHONE_PROMPT, "購買人電話是?")
        } else {
            return await stepContext.next()
        }
    }

    async BuyerPhoneStep1(stepContext) {
        console.log("BuyerPhoneStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.buyerPhone === undefined && stepContext.result) {
            userInfo.buyerPhone = stepContext.result
        }
        console.log("購買人電話: ", userInfo.buyerPhone)
        return await stepContext.endDialog()
    }

    async validatePhone(validatorContext) {
        // Validate that the user entered a minimum length for their name
        const value = (validatorContext.recognized.value || '').trim();
        const re_tphone = /^[2]{1}\d{7}$/
        const re_cphone = /^[0]{1}[9]{1}\d{8}$/
        if (value.search(re_tphone) != -1) {
            return VALIDATION_SUCCEEDED;
        } else if (value.search(re_cphone) != -1) {
            return VALIDATION_SUCCEEDED;
        } else {
            await validatorContext.context.sendActivity("電話號碼格式錯誤，請輸入如09XXXXXXXX。");
            return VALIDATION_FAILED;
        }
    }
}

module.exports.BuyerPhoneDialog = BuyerPhoneDialog