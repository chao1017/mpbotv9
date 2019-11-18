// 主要對話流程
// 基本上所有對話都是由他衍伸出去

// Import require Package
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { UserInfo } = require('./resource/userInfo')
const { FindDialog } = require('./productDialogs/findDialog')
const { ShowProductDialog } = require('./productDialogs/showProductDialog')
const { ShowOrderDialog } = require('./orderlistDialogs/showOrderList')
const { ShippingWayDialog } = require('./shippingwayDialogs/shippingWayDialog')
const { ConsigneeNameDialog } = require('./consigneeDialogs/consigneeNameDialog')
const { ConsigneeEmailDialog } = require('./consigneeDialogs/consigneeEmailDialog')
const { ConsigneePhoneDialog } = require('./consigneeDialogs/consigneePhoneDialog')
const { SameOneDialog } = require('./sameOneDialog')
const { PaymentWayDialog } = require('./paymentwayDialogs/paymentWayDialog')

// Define the property accessors.
const BOT_PROMPT = "botPrompt"
const MAIN_PROMPT = "mainPrompt"
const MAINPROUCT_PROMPT = "mainproductPrompt"
const FIND_PROMPT = "findPrompt"
const SHOWPRODUCT_PROMPT = "showProductPrompt"
const SHOWORDER_PROMPT = "showorderPrompt"
const SHIPPINGWAY_PROMPT = "shippingwayPrompt"
const MAINCONSIGNEE_PROMPT = "mainconsigneePrompt"
const CONSIGNEENAME_PROMPT = "consigneenamePrompt"
const CONSIGNEEEMAIL_PROMPT = "consigneeemailPrompt"
const CONSIGNEEPHONE_PROMPT = "consigneephonePrompt"
const SAMEONE_PROMPT = "sameonePrompt"
const PAYMENTWAY_PROMPT = "paymentwayPrompt"

const TEXT_PROMPT = "textprompt"
const NUMBER_PROMPT = "numberprompt"


class MainDialog extends ComponentDialog {
    constructor(dialogStateAccessor, userProfileAccessor) {
        super(MAIN_PROMPT)

        this.dialogStateAccessor = dialogStateAccessor
        this.userProfileAccessor = userProfileAccessor

        // Create Prompt Dialog
        this.addDialog(new TextPrompt(TEXT_PROMPT))
        this.addDialog(new NumberPrompt(NUMBER_PROMPT))

        // Create WaterfallDialog
        this.addDialog(new FindDialog(FIND_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowProductDialog(SHOWPRODUCT_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowOrderDialog(SHOWORDER_PROMPT, this.userProfileAccessor))
            .addDialog(new ShippingWayDialog(SHIPPINGWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new ConsigneeNameDialog(CONSIGNEENAME_PROMPT, this.userProfileAccessor))
            .addDialog(new ConsigneeEmailDialog(CONSIGNEEEMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new ConsigneePhoneDialog(CONSIGNEEPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new SameOneDialog(SAMEONE_PROMPT, this.userProfileAccessor))
            .addDialog(new PaymentWayDialog(PAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(BOT_PROMPT, [
                this.initializationStep.bind(this),
                this.mainStep1.bind(this),
                this.mainStep2.bind(this),
                this.mainStep3.bind(this),
                this.mainStep4.bind(this),
                this.mainStep5.bind(this),
                this.mainStep6.bind(this),
                this.mainStep7.bind(this),
            ]))
            .addDialog(new WaterfallDialog(MAINPROUCT_PROMPT, [
                this.ProdcutStep1.bind(this),
            ]))
            .addDialog(new WaterfallDialog(MAINCONSIGNEE_PROMPT, [
                this.ConsigneeStep1.bind(this),
                this.ConsigneeStep2.bind(this),
                this.ConsigneeStep3.bind(this),
            ]))

        // Set initialDialogId
        this.initialDialogId = BOT_PROMPT
    }

    async run(turnContext) {
        console.log("run")
        // Create DialogSet Object
        const dialogSet = new DialogSet(this.dialogStateAccessor)
        dialogSet.add(this)

        // Creates a dialog context
        const dialogContext = await dialogSet.createContext(turnContext)

        // ContinueDialog
        console.log("run continueDialog start")
        const result = await dialogContext.continueDialog()
        console.log("run continueDialog end")
        if (result.status === DialogTurnStatus.empty) {
            // BeginDialog
            await dialogContext.beginDialog(this.id)
        }
    }

    async initializationStep(stepContext) {
        console.log("initializationStep")
        let userInfo = await this.userProfileAccessor.get(stepContext.context)
        await this.userProfileAccessor.set(stepContext.context, new UserInfo())
        if (userInfo === undefined) {
            if (stepContext.options && stepContext.options.userInfo) {
                await this.userProfileAccessor.set(stepContext.context, stepContext.options.userInfo);
            } else {
                await this.userProfileAccessor.set(stepContext.context, new UserInfo());
            }
        }
        return await stepContext.next()
    }

    async mainStep1(stepContext) {
        console.log("mainStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.botId = stepContext.context.activity.recipient.id
        userInfo.userId = stepContext.context.activity.from.id
        userInfo.conversationId = stepContext.context.activity.conversation.id
        return await stepContext.beginDialog(MAINPROUCT_PROMPT)
    }

    async mainStep2(stepContext) {
        console.log("mainStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(SHIPPINGWAY_PROMPT)
        // return await stepContext.endDialog()
    }

    async mainStep3(stepContext) {
        console.log("mainStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(MAINCONSIGNEE_PROMPT)
    }

    async mainStep4(stepContext) {
        console.log("mainStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(SAMEONE_PROMPT)
    }

    async mainStep5(stepContext) {
        console.log("mainStep5")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
    }

    async mainStep6(stepContext) {
        console.log("mainStep6")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(SHOWORDER_PROMPT)
    }

    async mainStep7(stepContext) {
        console.log("mainStep7")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.endDialog()
    }

    // #region ProdcutStep
    async ProdcutStep1(stepContext) {
        console.log("ProdcutStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (stepContext.context.activity.text == "繼續購買原商品") {
            return await stepContext.beginDialog(FIND_PROMPT)
        }
        if (stepContext.context.activity.text != "更多商品") {
            userInfo.productId = stepContext.context.activity.text
        }
        if (isNaN(userInfo.productId)) {
            await stepContext.context.sendActivity("商品編號錯誤");
            await stepContext.context.sendActivity("請輸入正確商品編號");
            return await stepContext.cancelAllDialogs()
        } else {
            return await stepContext.beginDialog(FIND_PROMPT)
        }
    }

    // #region ConsigneeStep
    async ConsigneeStep1(stepContext) {
        console.log("ConsigneeStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEENAME_PROMPT)
    }

    async ConsigneeStep2(stepContext) {
        console.log("ConsigneeStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEPHONE_PROMPT)
    }

    async ConsigneeStep3(stepContext) {
        console.log("ConsigneeStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEEMAIL_PROMPT)
    }
    // #endregion
}

module.exports.MainDialog = MainDialog