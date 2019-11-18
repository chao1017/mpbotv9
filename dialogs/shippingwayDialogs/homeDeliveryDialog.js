// 選擇宅配時進入此對話
// 並讓使用者選取及輸入地址

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const TWzip = require("../resource/TWzipcode_20180607.json")

// const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHIPPINGWAY_PROMPT = "shippingwayPrompt"
const HOMEDELIVERY_PROMPT = "homedeliveryPrompt"

var TW_Area = ["北部", "中部", "南部", "東部"]
var north = ["基隆市", "臺北市", "新北市", "桃園市", "宜蘭縣", "新竹市", "新竹縣"]
var middle = ["苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣"]
var south = ["嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣"]
var east = ["臺東縣", "花蓮縣"]


class HomeDeliveryDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || HOMEDELIVERY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(SHIPPINGWAY_PROMPT, [
                this.HomeDeliveryStep0.bind(this),
                this.HomeDeliveryStep1.bind(this),
                this.HomeDeliveryStep2.bind(this),
                this.HomeDeliveryStep3.bind(this),
                this.HomeDeliveryStep4.bind(this)
            ]))

        this.initialDialogId = SHIPPINGWAY_PROMPT
    }

    async HomeDeliveryStep0(stepContext) {
        console.log("HomeDeliveryStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let TW
        let TWCard = []
        TW_Area.forEach(element => {
            switch (element) {
                case "北部":
                    TW = CardFactory.heroCard("", [], [element], { text: "基隆市，臺北市，新北市\n桃園市，宜蘭縣，新竹市，新竹縣" })
                    TWCard.push(TW)
                    break;
                case "中部":
                    TW = CardFactory.heroCard("", [], [element], { text: "苗栗縣，臺中市\n彰化縣，南投縣，雲林縣" })
                    TWCard.push(TW)
                    break;
                case "南部":
                    TW = CardFactory.heroCard("", [], [element], { text: "嘉義市，嘉義縣\n臺南市，高雄市，屏東縣" })
                    TWCard.push(TW)
                    break;
                case "東部":
                    TW = CardFactory.heroCard("", [], [element], { text: "臺東縣，花蓮縣" })
                    TWCard.push(TW)
                    break;
                default:
                    break;
            }
        });
        let TWCards = MessageFactory.carousel(TWCard)
        
        if (!userInfo.district) {
            await stepContext.context.sendActivity(TWCards)
            return await stepContext.prompt(TEXT_PROMPT, "請選擇區域")
        } else {
            return await stepContext.next()
        }
    }

    async HomeDeliveryStep1(stepContext) {
        console.log("HomeDeliveryStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.district === undefined && stepContext.result) {
            userInfo.district = stepContext.result
        }
        console.log("區域 : ", userInfo.district)
        if (TW_Area.includes(userInfo.district)) {
            let areaCard
            switch (userInfo.district) {
                case "北部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            north
                        )
                    )
                    break;
                case "中部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            middle
                        )
                    )
                    break;
                case "南部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            south
                        )
                    )
                    break;
                case "東部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            east
                        )
                    )
                    break;
                default:
                    break;
            }

            if (!userInfo.city) {
                await stepContext.context.sendActivity(areaCard)
                return await stepContext.prompt(TEXT_PROMPT, "請選擇縣市")
            } else {
                return await stepContext.next()
            }
        } else {
            await stepContext.context.sendActivity("選區域很難嗎?")
            userInfo.district = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        }
    }

    async HomeDeliveryStep2(stepContext) {
        console.log("HomeDeliveryStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.city === undefined && stepContext.result) {
            userInfo.city = stepContext.result
        }
        console.log("縣市 : ", userInfo.city)
        if (!north.includes(userInfo.city) && !middle.includes(userInfo.city) && !south.includes(userInfo.city) && !east.includes(userInfo.city)) {
            await stepContext.context.sendActivity("選的很難是不是?")
            userInfo.city = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        } else {
            userInfo.areaData = []
            TWzip.forEach(element => {
                if (element.City == userInfo.city) {
                    if (!userInfo.areaData.includes(element.Area)) {
                        userInfo.areaData.push(element.Area)
                    }
                }
            });
            const AreaCard = MessageFactory.attachment(
                CardFactory.heroCard(
                    "",
                    [],
                    userInfo.areaData
                )
            )
            
            if (!userInfo.area) {
                await stepContext.context.sendActivity(AreaCard)
                return await stepContext.prompt(TEXT_PROMPT, "請選擇鄉鎮市區")
            } else {
                return await stepContext.next()
            }
        }
    }

    async HomeDeliveryStep3(stepContext) {
        console.log("HomeDeliveryStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.area === undefined && stepContext.result) {
            userInfo.area = stepContext.result
        }
        console.log("鄉鎮市區: ", userInfo.area)
        if (userInfo.areaData.includes(userInfo.area)) {
            userInfo.areaData = []

            TWzip.forEach(element => {
                if (element.City == userInfo.city && element.Area == userInfo.area) {
                    if (userInfo.area == element.Area) {
                        let re = /^\d{3}/
                        let zip3 = re.exec(element.Zip5)
                        userInfo.zipCode = zip3[0]
                    }
                }
            });

            if (!userInfo.otherAddr) {
                return await stepContext.prompt(TEXT_PROMPT, "請輸入其餘部分")
            } else {
                return await stepContext.next()
            }
        } else {
            await stepContext.context.sendActivity("到底想幹嘛?")
            await stepContext.context.sendActivity("用選的啦!!")
            userInfo.area = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        }
    }

    async HomeDeliveryStep4(stepContext) {
        console.log("HomeDeliveryStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.otherAddr === undefined && stepContext.result) {
            userInfo.otherAddr = stepContext.result
        }
        console.log("其餘部分 : ", userInfo.otherAddr)
        return await stepContext.endDialog()
    }
}

module.exports.HomeDeliveryDialog = HomeDeliveryDialog