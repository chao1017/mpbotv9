// 呼叫API 尋找該筆商品資訊

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ProductInfo_API = require('../../lib/productInfo_API')
const StoreInfo_API = require('../../lib/storeInfo_API')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const FIND_PROMPT = "findPrompt"
const SHOWPRODUCT_PROMPT = "showProductPrompt"

class FindDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || FIND_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.findStep1.bind(this),
                this.findStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async findStep1(stepContext) {
        console.log("findStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let pid = userInfo.productId
        await stepContext.context.sendActivity("正在搜尋商品...");
        await stepContext.context.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1000 }
        ]);

        console.log("ProductInfo.info start")
        await ProductInfo_API.catch_info(pid).then(function (value) {
            console.log("ProductInfo.info end")
            // console.log("product.error : ", JSON.parse(value).error)
            console.log("product.msg : ", JSON.parse(value).msg)
            // console.log("product.data : ", JSON.parse(value).data)
            if (JSON.parse(value).error == 0) {
                userInfo.product = JSON.parse(value).data
            } else {
                userInfo.product = null
            }
        })

        if (userInfo.product != null) {
            console.log("storeInfo.info start")
            await StoreInfo_API.catch_info(userInfo.product.mp_store_id).then(function (value) {
                console.log("storeInfo.info end")
                // console.log("store.error : ", JSON.parse(value).error)
                console.log("store.msg : ", JSON.parse(value).msg)
                // console.log("store.data : ", JSON.parse(value).data)
                if (JSON.parse(value).error == 0) {
                    userInfo.store = JSON.parse(value).data
                } else {
                    userInfo.store = null
                }
            })
        }
        return stepContext.next()
    }

    async findStep2(stepContext) {
        console.log("findStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.product == null) {
            await stepContext.context.sendActivity("搜尋結果: 查無此商品")
            await stepContext.context.sendActivity("請關閉機器人。");
            // return stepContext.cancelAllDialogs()
            return await stepContext.endDialog()
        } else if (userInfo.productIdList.includes(userInfo.productId)) {
            return await stepContext.beginDialog(SHOWPRODUCT_PROMPT)
        } else {
            userInfo.productIdList.push(userInfo.productId)
            // console.log("productIdList : ", userInfo.productIdList)
            return await stepContext.beginDialog(SHOWPRODUCT_PROMPT)
        }
    }
}

module.exports.FindDialog = FindDialog