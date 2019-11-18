// 取得收件人電話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const PHONE_PROMPT = "phonePrompt"
const CONSIGNEEPHONE_PROMPT = "consigneephonePrompt"

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;


class ConsigneePhoneDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CONSIGNEEPHONE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(PHONE_PROMPT, this.validatePhone))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ConsigneePhoneStep0.bind(this),
                this.ConsigneePhoneStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ConsigneePhoneStep0(stepContext) {
        console.log("ConsigneePhoneStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.consigneePhone) {
            return await stepContext.prompt(PHONE_PROMPT, "收件人電話是?")
        } else {
            return await stepContext.next()
        }
    }

    async ConsigneePhoneStep1(stepContext) {
        console.log("ConsigneePhoneStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.consigneePhone === undefined && stepContext.result) {
            userInfo.consigneePhone = stepContext.result
        }
        console.log("收件人電話: ", userInfo.consigneePhone)
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
            await validatorContext.context.sendActivity("電話號碼格式錯誤，請輸入如09XXXXXXXX 或 2XXXXXXX 。");
            return VALIDATION_FAILED;
        }
    }
}

module.exports.ConsigneePhoneDialog = ConsigneePhoneDialog