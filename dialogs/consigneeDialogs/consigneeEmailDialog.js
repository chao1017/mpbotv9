// 取得收件人信箱

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const EMAIL_PROMPT = "emailPrompt"
const CONSIGNEEEMAIL_PROMPT = "consigneeemailPrompt"

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

class ConsigneeEmailDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CONSIGNEEEMAIL_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(EMAIL_PROMPT, this.validateEmail))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ConsigneeEmailStep0.bind(this),
                this.ConsigneeEmailStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ConsigneeEmailStep0(stepContext) {
        console.log("ConsigneeEmailStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.consigneeEmail) {
            return await stepContext.prompt(EMAIL_PROMPT, "收件人信箱是?")
        } else {
            return await stepContext.next()
        }
    }

    async ConsigneeEmailStep1(stepContext) {
        console.log("ConsigneeEmailStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.consigneeEmail === undefined && stepContext.result) {
            userInfo.consigneeEmail = stepContext.result
        }
        console.log("收件人信箱: ", userInfo.consigneeEmail)
        return await stepContext.endDialog()
    }

    async validateEmail(validatorContext) {
        // Validate that the user entered a minimum length for their name
        const value = (validatorContext.recognized.value || '').trim();
        const re_email = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
        if (value.search(re_email) != -1) {
            return VALIDATION_SUCCEEDED;
        } else {
            await validatorContext.context.sendActivity(`信箱格式錯誤，請重新輸入。`);
            return VALIDATION_FAILED;
        }
    }
}

module.exports.ConsigneeEmailDialog = ConsigneeEmailDialog