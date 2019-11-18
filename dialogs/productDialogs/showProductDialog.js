// 顯示商品資訊並詢問後續動作
// 藉由動作導引至不同對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ShowSpecificationDialog } = require("./showSpecificationDialog")
const { ShowMoreDialog } = require("./showMoreDialog")
const { ShareProductDialog } = require("./shareProductDialog")
const { ShowOrderDialog } = require("../orderlistDialogs/showOrderList")


const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHOWPRODUCT_PROMPT = "showProductPrompt"
const SHOWSPECIFICATION_PROMPT = "showspecificationPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"
const SHOWORDER_PROMPT = "showorderPrompt"
const SHARERODUCT_PROMPT = "shareproductPrompt"

class ShowProductDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SHOWPRODUCT_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ShowSpecificationDialog(SHOWSPECIFICATION_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowMoreDialog(SHOWMORE_PROMPT, this.userProfileAccessor))
            .addDialog(new ShareProductDialog(SHARERODUCT_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowOrderDialog(SHOWORDER_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.showProductStpe0.bind(this),
                this.showProductStpe1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async showProductStpe0(stepContext) {
        console.log("showProductStpe0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.product) {
            console.log("create imagecard")
            var imageCard = []
            if (!userInfo.product.product_img_list) {
                var img = CardFactory.heroCard(userInfo.product.product_name, [userInfo.noneImage])
                imageCard.push(img)
            } else {
                Object.keys(userInfo.product.product_img_list).map(function (num, index) {
                    let url = userInfo.product.product_img_list[num].img_url_l
                    let img = CardFactory.heroCard(userInfo.product.product_name, [url])
                    imageCard.push(img)
                })
            }
            const imageCards = MessageFactory.carousel(imageCard)
            await stepContext.context.sendActivity(imageCards);

            console.log("create sizeimagecard")
            var sizeImageCard = []
            if (userInfo.product.product_size_img_info) {
                let url = userInfo.product.product_size_img_info.img_url_l
                let sizeimg = CardFactory.heroCard("尺寸圖", [url])
                sizeImageCard.push(sizeimg)
            }
            const sizeImageCards = MessageFactory.carousel(sizeImageCard)
            await stepContext.context.sendActivity(sizeImageCards);

            console.log("create contentcard")
            var productContentCard = []
            if (userInfo.product.product_content == "null") {
                let productContent = CardFactory.heroCard("無商品介紹", [], [])
                productContentCard.push(productContent)
            } else {
                let productContent = CardFactory.heroCard(userInfo.product.product_content, [], [])
                productContentCard.push(productContent)
            }
            const productContentCards = MessageFactory.carousel(productContentCard)
            await stepContext.context.sendActivity(productContentCards);
        }
        var choice
        if (!userInfo.orderData) {
            choice = MessageFactory.suggestedActions(["購買", "更多商品", "分享商品"])
        } else {
            // choice = MessageFactory.suggestedActions(["購買", "更多商品", "分享商品"])
            choice = MessageFactory.suggestedActions(["購買", "更多商品", "分享商品", "查看購物車"])
        }

        if (!userInfo.choice) {
            await stepContext.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 2000 }
            ]);
            return await stepContext.prompt(TEXT_PROMPT, choice)
        } else {
            return await stepContext.next()
        }
    }

    async showProductStpe1(stepContext) {
        console.log("showProductStpe1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.choice === undefined && stepContext.result) {
            userInfo.choice = stepContext.result
        }
        console.log("動作: ", userInfo.choice)

        switch (userInfo.choice) {
            case "購買":
                userInfo.choice = undefined
                return await stepContext.beginDialog(SHOWSPECIFICATION_PROMPT)
            case "更多商品":
                userInfo.choice = undefined
                return await stepContext.replaceDialog(SHOWMORE_PROMPT)
            case "分享商品":
                userInfo.choice = undefined
                return await stepContext.beginDialog(SHARERODUCT_PROMPT)
            case "查看購物車":
                userInfo.choice = undefined
                return await stepContext.beginDialog(SHOWORDER_PROMPT)
            // return await stepContext.endDialog()
            default:
                await stepContext.context.sendActivity("請點選下方按鈕。")
                userInfo.choice = undefined
                await stepContext.context.sendActivities([
                    { type: 'typing' },
                    { type: 'delay', value: 1000 }
                ]);
                return await stepContext.beginDialog(SHOWPRODUCT_PROMPT)
        }
    }
}

module.exports.ShowProductDialog = ShowProductDialog