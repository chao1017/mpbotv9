// 呼叫API 抓取更多商品資訊 並顯示出來

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ProductInfo_API = require('../../lib/productInfo_API')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHOWMORE_PROMPT = "showmorePrompt"
const MAINPROUCT_PROMPT = "mainproductPrompt"
var moreProductId

class ShowMoreDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SHOWMORE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.showMoreStep1.bind(this),
                this.showMoreStep2.bind(this),
                // this.showMoreStep3.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async showMoreStep1(stepContext) {
        console.log("showMoreStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var moreProduct
        console.log("ProductInfo.more start")
        await ProductInfo_API.catch_more(userInfo.productId).then(function (value) {
            console.log("ProductInfo.more end")
            // console.log("product.error : ", JSON.parse(value).error)
            console.log("product.msg : ", JSON.parse(value).msg)
            // console.log("product.data : ", JSON.parse(value).data)
            if (JSON.parse(value).error == 0) {
                moreProduct = JSON.parse(value).data.info
            }
        })
        var productCard = []
        moreProductId = []
        await Object.keys(moreProduct).map(function (num, index) {
            // console.log("img_url_l: ", moreProduct[num].product_img_info.img_url_l)
            // console.log("product_name: ", moreProduct[num].product_name)
            // console.log("product_content: ", moreProduct[num].product_content)
            // console.log("pid: ", moreProduct[num].pid)
            moreProductId.push(num)
            let product
            if (moreProduct[num].product_img_info == null || moreProduct[num].product_img_info == "" || moreProduct[num].product_img_info == "null") {
                product = CardFactory.heroCard(
                    "",
                    "",
                    ["https://i.imgur.com/QfZ13jr.jpg"],
                    [
                        {
                            type: "postBack",
                            title: '選擇',
                            value: moreProduct[num].pid
                        },
                    ],
                    {
                        title: moreProduct[num].product_name,
                        text: moreProduct[num].product_content,
                        subtitle: "$" + moreProduct[num].product_price
                    },
                );
            }
            else {
                product = CardFactory.heroCard(
                    "",
                    "",
                    [moreProduct[num].product_img_info.img_url_l],
                    [
                        {
                            type: "postBack",
                            title: '選擇',
                            value: moreProduct[num].pid
                        },
                    ],
                    {
                        title: moreProduct[num].product_name,
                        text: moreProduct[num].product_content,
                        subtitle: "$" + moreProduct[num].product_price
                    },
                );
            }
            productCard.push(product)
        })
        const productCards = MessageFactory.carousel(productCard)
        await stepContext.context.sendActivity(productCards)
        if (!userInfo.originProductId) {
            return await stepContext.prompt(TEXT_PROMPT, "請問您要看哪一個呢?")
        } else {
            return await stepContext.next()
        }
    }

    async showMoreStep2(stepContext) {
        console.log("showMoreStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (moreProductId.includes(stepContext.result)) {
            userInfo.originProductId = stepContext.result
            userInfo.productId = userInfo.originProductId
            userInfo.originProductId = undefined
            return await stepContext.replaceDialog(MAINPROUCT_PROMPT)
        } else {
            await stepContext.context.sendActivity('不選是怎樣?')
            return await stepContext.beginDialog(SHOWMORE_PROMPT)
        }
    }
}

module.exports.ShowMoreDialog = ShowMoreDialog