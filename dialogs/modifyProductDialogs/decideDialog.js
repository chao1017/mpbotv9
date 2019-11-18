// 讓使用者決定 修改數量 或 刪除商品
// 依照選擇不同前往專屬對話

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ModifyProductDialog } = require('./modifyProductDialog')
const { DeleteProductDialog } = require('./deleteProductDialog')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = "textprompt"
const DECIDE_PROMPT = "decideprompt"
const MODIFY_PROMPT = "modifyprompt"
const DELETE_PROMPT = "deleteprompt"
const SHOWORDER_PROMPT = "showorderPrompt"


class DecideDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || DECIDE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new DeleteProductDialog(DELETE_PROMPT, this.userProfileAccessor))
            .addDialog(new ModifyProductDialog(MODIFY_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.DecideStep1.bind(this),
                this.DecideStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async DecideStep1(stepContext) {
        console.log("DecideStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var orderCard = []
        userInfo.orderData.order_detail.forEach(element => {
            let value_m = {
                pid: element.pid,
                psid: element.psid,
                spec1: element.product_spec1,
                quantity: element.product_quantity,
                mode: "modify",
            }
            let value_d = {
                pid: element.pid,
                psid: element.psid,
                spec1: element.product_spec1,
                quantity: element.product_quantity,
                mode: "delete",
            }
            let value_b = {
                mode: "back"
            }
            const orderItem = CardFactory.heroCard(
                '',
                '',
                CardFactory.images([element.product_img_info.img_url_l]),
                CardFactory.actions([
                    {
                        type: 'postBack',
                        title: '修改數量',
                        value: JSON.stringify(value_m)
                    },
                    {
                        type: 'postBack',
                        title: '刪除商品',
                        value: JSON.stringify(value_d)
                    },
                    {
                        type: 'postBack',
                        title: '返回',
                        value: JSON.stringify(value_b)
                    }
                ]),
                {
                    title: element.product_name,
                    text: '數量: ' + element.product_quantity,
                    subtitle: '規格: ' + element.product_spec1
                }
            )
            orderCard.push(orderItem)
        });
        const orderCards = MessageFactory.carousel(orderCard)
        await stepContext.context.sendActivity(orderCards)
        if (!userInfo.orderchange) {
            return await stepContext.prompt(TEXT_PROMPT, "請選擇修改或刪除")
        } else {
            return await stepContext.next()
        }
    }

    async DecideStep2(stepContext) {
        console.log("DecideStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.orderchange === undefined && stepContext.result) {
            userInfo.orderchange = stepContext.result
            console.log("userInfo.orderchange: ", userInfo.orderchange)
        }
        var value = []
        var value_m, value_d, value_b
        userInfo.orderData.order_detail.forEach(element => {
            value_m = {
                pid: element.pid,
                psid: element.psid,
                spec1: element.product_spec1,
                quantity: element.product_quantity,
                mode: "modify",
            }
            value_d = {
                pid: element.pid,
                psid: element.psid,
                spec1: element.product_spec1,
                quantity: element.product_quantity,
                mode: "delete",
            }
            value_b = {
                mode: "back",
            }
            value.push(JSON.stringify(value_m))
            value.push(JSON.stringify(value_d))
            value.push(JSON.stringify(value_b))
        })
        // console.log(userInfo.orderchange)
        console.log(`value: ${value}`)
        if (value.includes(userInfo.orderchange)) {
            console.log("1")
            if (JSON.parse(userInfo.orderchange).mode == "modify") {
                console.log("2")
                // return await stepContext.endDialog()
                return await stepContext.beginDialog(MODIFY_PROMPT)
            } else if (JSON.parse(userInfo.orderchange).mode == "delete") {
                console.log("3")
                userInfo.choice = undefined
                return await stepContext.beginDialog(DELETE_PROMPT)
            } else if (JSON.parse(userInfo.orderchange).mode == "back") {
                console.log("4")
                userInfo.choice = undefined
                return await stepContext.beginDialog(SHOWORDER_PROMPT)
            }
        } else {
            console.log("5")
            userInfo.choice = undefined
            userInfo.orderchange = undefined
            stepContext.context.sendActivity("是要不要修改商品?")
            return await stepContext.beginDialog(DECIDE_PROMPT)
        }

    }
}

module.exports.DecideDialog = DecideDialog