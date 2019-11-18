// 取得購買人姓名

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const BUYERNAME_PROMPT = "buyernamePrompt"

class BuyerNameDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || BUYERNAME_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.BuyerNameStep0.bind(this),
                this.BuyerNameStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async BuyerNameStep0(stepContext) {
        console.log("BuyerNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.buyerName) {
            return await stepContext.prompt(TEXT_PROMPT, "購買人姓名是?")
        } else {
            return await stepContext.next()
        }
    }

    async BuyerNameStep1(stepContext) {
        console.log("BuyerNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.buyerName === undefined && stepContext.result) {
            userInfo.buyerName = stepContext.result
        }
        console.log("購買人姓名: ", userInfo.buyerName)
        return await stepContext.endDialog()
    }
}

module.exports.BuyerNameDialog = BuyerNameDialog