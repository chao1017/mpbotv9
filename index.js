// 執行各項基礎設定 並將結帳資訊 經由/api/payment送出

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const appInsights = require("applicationinsights");
const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');
const url = require("url");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, ConversationState, UserState, MemoryStorage } = require('botbuilder');
const { CosmosDbStorage } = require('botbuilder-azure');
const { BlobStorage } = require('botbuilder-azure');

// This bot's main dialog.
const { MpBot } = require('./bots/bot');

// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Create Application Insights
appInsights.setup(process.env.INSIGHTS_KEY);
appInsights.start();

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open the emulator select "Open Bot"`);
});

// var storage = new MemoryStorage();

var blobStorage = new BlobStorage({
    containerName: process.env.BLOB_NAME,
    storageAccountOrConnectionString: process.env.BLOB_STRING
});

var cosmosDBStorage = new CosmosDbStorage({
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT,
    authKey: process.env.AUTH_KEY,
    databaseId: process.env.DATABASE,
    collectionId: process.env.COLLECTION
})

let conversationState = new ConversationState(blobStorage)
let userState = new UserState(blobStorage)

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {

    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);

    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    await context.sendActivity(`${error}`);
};

// Create the main dialog.
const mpbot = new MpBot(cosmosDBStorage, conversationState, userState);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {

        // Route to main dialog.
        console.log("===============Turn start===============")
        await mpbot.run(context);
        console.log("===============Turn   end===============")
    });
});

server.use(restify.plugins.bodyParser({ mapParams: true }));

server.get('/api/payment', async (req, res) => {
    var parsedUrl = url.parse(req.url, true);
    var cid = parsedUrl.query.cid;
    var uid = parsedUrl.query.uid;

    // Read from the storage
    var storeItems = await cosmosDBStorage.read([cid])
    // console.log("storeItems : ", storeItems)
    console.log(storeItems)
    var data
    var check

    // Debugger
    try {
        // Check the result.
        if (typeof (storeItems[cid]) != 'undefined') {

            // The log exists so we can write to it.
            if (storeItems[cid].userId) {
                check = 'ok'
                data = storeItems[cid].postData
                console.log("postData: ", data)
            }
        }
    } catch (error) {
        check = 'error'
        storeItems[cid].error = error
        await cosmosDBStorage.write(storeItems)
    }
    if (check == 'error') {
        res.write('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>發生錯誤，請關閉網頁。</body></html>')
    } else {
        res.write('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>' + data + '</body></html>')
    }
    res.end()
});