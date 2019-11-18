// 將對話資料存入cosmosDB 及Blobstorage

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { MainDialog } = require('../dialogs/mainDialog')

// Add memory storage.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

class MpBot extends ActivityHandler {
    constructor(cosmosDBStorage, conversationState, userState) {
        super();

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');

        this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this.conversationState = conversationState
        this.userState = userState

        const mainDialog = new MainDialog(this.conversationData, this.userProfile)

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (turnContext, next) => {
            console.log("onMessage")
            const userInfo = await this.userProfile.get(turnContext);

            console.log("===============logMessageText start===============")
            // Save updated utterance inputs.
            await logMessageText(cosmosDBStorage, this.conversationData, this.userProfile, turnContext, userInfo);
            console.log("===============logMessageText   end===============")
            
            console.log("===============mainDialog.run start===============")
            await mainDialog.run(turnContext)
            console.log("===============mainDialog.run   end===============")
            
            console.log("===============logMessageText start===============")
            // Save updated utterance inputs.
            await logMessageText(cosmosDBStorage, this.conversationData, this.userProfile, turnContext, userInfo);
            console.log("===============logMessageText   end===============")
            
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (turnContext, next) => {
            console.log("onMembersAdded")
            // console.log("userInfo: ", userInfo)
            const membersAdded = turnContext.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivities([
                        { type: 'typing' },
                        { type: 'delay', value: 1000 }
                    ]);
                    await turnContext.sendActivity('歡迎光臨!!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (turnContext, next) => {
            console.log("onDialog start")

            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(turnContext, false);
            await this.userState.saveChanges(turnContext, false);
            console.log("onDialog end")

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        })
    }
}

// This function stores new user messages. Creates new utterance log if none exists.
async function logMessageText(cosmosDBStorage, conversationData, userProfile, turnContext, userInfo) {
    let utterance = turnContext.activity.text;
    let botId = turnContext.activity.recipient.id;
    let userId = turnContext.activity.from.id;
    let conversationId = turnContext.activity.conversation.id;

    // debugger;
    try {
        // Read from the storage.
        let storeItems = await cosmosDBStorage.read([conversationId])
        console.log("storeItems : ", storeItems)

        // Check the result.
        if (typeof (storeItems[conversationId]) != 'undefined') {

            // The log exists so we can write to it.
            if (storeItems[conversationId].userId == userId) {
                storeItems[conversationId].turnNumber++;
                if (!userProfile.name) {
                    storeItems[conversationId].UtteranceList.push(utterance);
                } else {
                    storeItems[conversationId].Name = userProfile.name;
                    if (utterance != userProfile.name) {
                        storeItems[conversationId].UtteranceList.push(utterance);
                    }
                }
                if (userInfo) {
                    if (userInfo.postData) {
                        storeItems[conversationId].postData = userInfo.postData
                    }
                }

                try {
                    await cosmosDBStorage.write(storeItems)
                } catch (err) {
                    await turnContext.sendActivity(`Write failed of UtteranceLogJS: ${err}`);
                }
            }
        }
        else {
            var turnNumber = 1;
            storeItems[conversationId] = { userId: [`${userId}`], botId: [`${botId}`], UtteranceList: [`${utterance}`], "eTag": "*", turnNumber }
            if (storeItems[conversationId].userId == userId) {
                try {
                    await cosmosDBStorage.write(storeItems)
                } catch (err) {
                    await turnContext.sendActivity(`Write failed: ${err}`);
                }
            }
        }
    }
    catch (err) {
        await turnContext.sendActivity(`Read rejected. ${err}`);
    }
}



module.exports.MpBot = MpBot;
