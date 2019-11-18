// 取得購買人信箱

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const EMAIL_PROMPT = "emailPrompt"
const BUYEREMAIL_PROMPT = "buyeremailPrompt"

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

class BuyerEmailDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || BUYEREMAIL_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(EMAIL_PROMPT, this.validateEmail))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.BuyerEmailStep0.bind(this),
                this.BuyerEmailStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async BuyerEmailStep0(stepContext) {
        console.log("BuyerEmailStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.buyerEmail) {
            return await stepContext.prompt(EMAIL_PROMPT, "購買人信箱是?")
        } else {
            return await stepContext.next()
        }
    }

    async BuyerEmailStep1(stepContext) {
        console.log("BuyerEmailStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.buyerEmail === undefined && stepContext.result) {
            userInfo.buyerEmail = stepContext.result
        }
        console.log("購買人信箱: ", userInfo.buyerEmail)
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

module.exports.BuyerEmailDialog = BuyerEmailDialog