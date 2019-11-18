// 產生分享連結的卡片

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ShowSpecificationDialog } = require("./showSpecificationDialog")
const { ShowMoreDialog } = require("./showMoreDialog")
const { ShowOrderDialog } = require("../orderlistDialogs/showOrderList")


const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHOWPRODUCT_PROMPT = "showProductPrompt"
const SHOWSPECIFICATION_PROMPT = "showspecificationPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"
const SHARERODUCT_PROMPT = "shareproductPrompt"

class ShareProductDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SHARERODUCT_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ShowSpecificationDialog(SHOWSPECIFICATION_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowMoreDialog(SHOWMORE_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.shareProductStpe0.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async shareProductStpe0(stepContext) {
        console.log("shareProductStpe0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var shareCard = []
        const selfShare = CardFactory.heroCard("", [userInfo.product.share_url.self.qrcode], [
            {
                type: "openUrl",
                title: '分享連結',
                value: userInfo.product.share_url.self.url
            }])
        const fbShare = CardFactory.heroCard("", [userInfo.product.share_url.fb.qrcode], [
            {
                type: "openUrl",
                title: '分享到FB',
                value: userInfo.product.share_url.fb.url
            }])
        const lineShare = CardFactory.heroCard("", [userInfo.product.share_url.line.qrcode], [
            {
                type: "openUrl",
                title: '分享到Line',
                value: userInfo.product.share_url.line.url
            }])
        shareCard.push(selfShare)
        shareCard.push(fbShare)
        shareCard.push(lineShare)
        const shareCards = MessageFactory.carousel(shareCard)
        await stepContext.context.sendActivity(shareCards);
        await stepContext.context.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1000 }
        ]);
        return await stepContext.beginDialog(SHOWPRODUCT_PROMPT)
    }
}

module.exports.ShareProductDialog = ShareProductDialog