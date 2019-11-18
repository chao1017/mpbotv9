// 顯示購物車資訊

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ShippingWayDialog } = require("../shippingwayDialogs/shippingWayDialog")
const { ShowMoreDialog } = require("../productDialogs/showMoreDialog")
const { ChangeDialog } = require("./changeDialog")
const { ConfirmPaymentDialog } = require("../paymentDialogs/confirmPaymentDialog")
const { ChoiceToDoDialog } = require("./choiceToDoDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHOWORDER_PROMPT = "showorderPrompt"
const SHIPPINGWAY_PROMPT = "shippingwayPrompt"
const SHOWMORE_PROMPT = "showmorePrompt"
const CHANGE_PROMPT = "changePrompt"
const CONFIRMPAYMENT_PROMPT = "confirmpaymentPrompt"
const CHOICETODO_PROMPT = "choicetodoPrompt"

class ShowOrderDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SHOWORDER_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ShippingWayDialog(SHIPPINGWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new ShowMoreDialog(SHOWMORE_PROMPT, this.userProfileAccessor))
            .addDialog(new ChangeDialog(CHANGE_PROMPT, this.userProfileAccessor))
            .addDialog(new ConfirmPaymentDialog(CONFIRMPAYMENT_PROMPT, this.userProfileAccessor))
            .addDialog(new ChoiceToDoDialog(CHOICETODO_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.showOrderStep1.bind(this),
                this.showOrderStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async showOrderStep1(stepContext) {
        console.log("showOrderStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.next()
    }

    async showOrderStep2(stepContext) {
        console.log("showOrderStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        const orderCard = {
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "Container",
                    "style": "default",
                    "items": []
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        }
        // console.log("userInfo.orderData : ", userInfo.orderData)
        userInfo.orderData.order_detail.forEach(element => {
            let imgUrl = {
                "type": "Image",
                "size": "Medium",
                "altText": ""
            }

            if (element.product_img_info == null || element.product_img_info == 'null' || element.product_img_info == "") {
                imgUrl.url = "https://i.imgur.com/QfZ13jr.jpg"
            }
            else{
                imgUrl.url = element.product_img_info.img_url_l
            }

            let orderItem = {
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "items": [],
                        "width": "auto"
                    },
                    {
                        "type": "Column",
                        "items": [
                            {
                                "type": "TextBlock",
                                "weight": "Bolder",
                                "text": element.product_name
                            },
                            {
                                "type": "TextBlock",
                                "spacing": "Small",
                                "text": "單價: $" + element.product_price
                            },
                            {
                                "type": "TextBlock",
                                "spacing": "Small",
                                "text": "規格: " + element.product_spec1
                            },
                            {
                                "type": "ColumnSet",
                                "spacing": "Small",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "items": [
                                            {
                                                "type": "TextBlock",
                                                "spacing": "Small",
                                                "text": "數量: " + element.product_quantity
                                            }
                                        ],
                                        "width": "stretch"
                                    },
                                    {
                                        "type": "Column",
                                        "items": [
                                            {
                                                "type": "TextBlock",
                                                "horizontalAlignment": "Right",
                                                "text": "小計: $" + element.item_sum_price
                                            }
                                        ],
                                        "width": "stretch"
                                    }
                                ]
                            }
                        ],
                        "width": "stretch"
                    }
                ]
            }
            orderItem.columns[0].items.push(imgUrl)
            orderCard.body[0].items.push(orderItem)
        });

        var shippingText = ""
        if (userInfo.store.full_shipping_amount == "0") {
            shippingText = "運費: $" + userInfo.store.shipping_amount
        } else {
            if ((userInfo.orderData.order_header.total_price * 1) >= (userInfo.store.full_shipping_amount * 1)) {
                shippingText = "(滿 $" + userInfo.store.full_shipping_amount + " 免運費) 運費: $0"
            } else {
                shippingText = "(滿 $" + userInfo.store.full_shipping_amount + " 免運費) 運費: $" + userInfo.store.shipping_amount
            }
        }
        let priceItem = {
            "type": "Container",
            "horizontalAlignment": "Right",
            "separator": true,
            "verticalContentAlignment": "Center",
            "items": [
                {
                    "type": "TextBlock",
                    "horizontalAlignment": "Right",
                    "text": shippingText
                },
                {
                    "type": "TextBlock",
                    "horizontalAlignment": "Right",
                    "text": "總計: $" + userInfo.orderData.order_header.total_price
                }
            ]
        }
        orderCard.body[0].items.push(priceItem)

        if (userInfo.shippingWay != undefined) {
            let buyItem = {
                "type": "Container",
                "horizontalAlignment": "Center",
                "style": "default",
                "verticalContentAlignment": "Center",
                "items": [
                    {
                        "type": "TextBlock",
                        "horizontalAlignment": "Left",
                        "size": "Medium",
                        "weight": "Bolder",
                        "text": "收件人資訊:"
                    },
                    {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "姓名:",
                                "value": userInfo.consigneeName
                            },
                            {
                                "title": "電話:",
                                "value": userInfo.consigneePhone
                            },
                            {
                                "title": "信箱:",
                                "value": userInfo.consigneeEmail
                            }
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "size": "Medium",
                        "weight": "Bolder",
                        "text": "購買人資訊:"
                    },
                    {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "姓名:",
                                "value": userInfo.buyerName
                            },
                            {
                                "title": "電話:",
                                "value": userInfo.buyerPhone
                            },
                            {
                                "title": "信箱:",
                                "value": userInfo.buyerEmail
                            }
                        ]
                    },
                ]
            }
            var shippinItem
            switch (userInfo.shippingWay) {
                case "宅配":
                    shippinItem = {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "取貨方式:",
                                "value": userInfo.shippingWay
                            },
                            {
                                "title": "取貨地點:",
                                "value": userInfo.zipCode + " " + userInfo.district + userInfo.city + userInfo.area + userInfo.otherAddr
                            },
                            {
                                "title": "付款方式:",
                                "value": userInfo.paymentWay
                            }
                        ]
                    }
                    break;
                case "自取":
                    shippinItem = {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "取貨方式:",
                                "value": userInfo.shippingWay
                            },
                            {
                                "title": "取貨地點:",
                                "value": userInfo.store.self_text
                            },
                            {
                                "title": "付款方式:",
                                "value": userInfo.paymentWay
                            }
                        ]
                    }
                    break;
                default:
                    shippinItem = {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "取貨方式:",
                                "value": userInfo.shippingWay
                            },
                            {
                                "title": "取貨地點:",
                                "value": "門市將在付款畫面做選擇"
                            },
                            {
                                "title": "付款方式:",
                                "value": userInfo.paymentWay
                            }
                        ]
                    }
            }
            buyItem.items.push(shippinItem)
            orderCard.body.push(buyItem)

            var storeItem = {
                "type": "Container",
                "style": "default",
                "items": [
                    {
                        "type": "TextBlock",
                        "size": "Medium",
                        "weight": "Bolder",
                        "text": "商家資訊:"
                    },
                    {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "店名:",
                                "value": userInfo.store.Mem_WebName
                            },
                            {
                                "title": "電話:",
                                "value": userInfo.store.Mem_WebTel
                            },
                            {
                                "title": "信箱:",
                                "value": userInfo.store.Mem_WebMail
                            }
                        ]
                    },
                ]
            }
            orderCard.body.push(storeItem)
        }
        await stepContext.context.sendActivity("購物車內容如下");
        var orderCards = CardFactory.adaptiveCard(orderCard)
        await stepContext.context.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1000 }
        ]);
        await stepContext.context.sendActivity({ attachments: [orderCards] });
        return await stepContext.beginDialog(CHOICETODO_PROMPT)
    }
}

module.exports.ShowOrderDialog = ShowOrderDialog