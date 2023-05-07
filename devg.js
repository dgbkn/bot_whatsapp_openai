const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
let setting = require("dotenv").config().parsed;
const youtubesearchapi = require("youtube-search");

const { getMenu, textDavinci003, memeHandler, stableDiffusionApi, dalleHandeler } = require("./commands");

module.exports = chatUpdateFunc = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
            ? m.message.videoMessage.caption
            : m.mtype == "extendedTextMessage"
              ? m.message.extendedTextMessage.text
              : m.mtype == "buttonsResponseMessage"
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype == "listResponseMessage"
                  ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                  : m.mtype == "templateButtonReplyMessage"
                    ? m.message.templateButtonReplyMessage.selectedId
                    : m.mtype === "messageContextInfo"
                      ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
                      : "";


    var messageBody = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = messageBody.trim().substring(messageBody.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => { }) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = messageBody.length > 30 ? `${q.substring(0, 30)}...` : messageBody;

    if (m.sender.replace("@s.whatsapp.net", "") == setting.owner) {
      return;
    }

    const emojiRegex = /\p{Emoji}/u;
    if (emojiRegex.test(body)) {
      return;
    }

    if (!isCmd2 && m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS Group ]" + groupName)), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));

      if (groupName == setting.group && body.includes("/bot")) {
        console.log("SAME GRP");
        try {

          // if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey has not been filled\n\nPlease fill in the apikey first in the key.json file\n\nApikey can be made on the website: https://beta.openai.com /account/api-keys");
          // if (!text) return reply(`Chat with AI.\n\nExample:\n ${prefix} ${command} What is recession`);
          const configurationAi = new Configuration({
            apiKey: setting.keyopenai,
          });
          const openai = new OpenAIApi(configurationAi);

          console.log(body);
          const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: body,
            temperature: 0, // Higher values means the model will take more risks.
            max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
            presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
          });
          m.reply(`${response.data.choices[0].text}`);
          // const templateMessage = {
          //   text: response.data.choices[0].text,
          // };

          // const sendMsg = await client.sendMessage(from, templateMessage);
        } catch (error) {
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
          } else {
            console.log(error);
            m.reply("Sorry, there seems to be an error :" + error.message);
          }
        }
      }
    }


    if (!isCmd2 && !m.isGroup) {
      try {
        console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));

        // if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey has not been filled\n\nPlease fill in the apikey first in the key.json file\n\nApikey can be made on the website: https://beta.openai.com /account/api-keys");
        // if (!text) return reply(`Chat with AI.\n\nExample:\n ${prefix} ${command} What is recession`);
        const configurationAi = new Configuration({
          apiKey: setting.keyopenai,
        });
        const openai = new OpenAIApi(configurationAi);

        console.log(body);

        // const messages = [];
        // messages.push({ role: "user", content: body });

        // const response = await openai.createChatCompletion({
        //   model: "gpt-3.5-turbo",
        //   messages: messages,
        //   // temperature: 0, // Higher values means the model will take more risks.
        //   // max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        //   // top_p: 1, // alternative to sampling with temperature, called nucleus sampling
        //   // frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
        //   // presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
        // });
        // m.reply(`${response.data.choices[0].message.content}`);


        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: text,
          temperature: 0.9, // Higher values means the model will take more risks.
          max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
          top_p: 1, // alternative to sampling with temperature, called nucleus sampling
          frequency_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
          presence_penalty: 0.6 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
        });
        m.reply(`${response.data.choices[0].text}`);
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
          console.log(`${error.response.status}\n\n${error.response.data}`);
        } else {
          console.log(error);
          m.reply("Sorry, there seems to be an error :" + error.message);
        }
      }
    }


    if (isCmd2 && (!m.isGroup || groupName == setting.group)) {


      console.log(chalk.black(chalk.bgWhite("[ LOGS  ]" + groupName == setting.group ? "Group" : "Personal")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd2) {
      // try{

      // }
      switch (command) {
        case "help":
        case "menu":
          m.reply(getMenu(prefix));
          break;
        case "bot": case "ai": case "openai":
          try {
            var resp = await textDavinci003(text);
            m.reply(resp);
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
              console.log(`${error.response.status}\n\n${error.response.data}`);
            } else {
              console.log(error);
              m.reply("Sorry, there seems to be an error :" + error.message);
            }
          }
          break;
        case "video": case "Video": case "yt":
          try {
            var opts = {
              maxResults: 4,
              key: setting.yt_key
            };

            youtubesearchapi(text, opts, function (err, results) {
              if (err) return console.log(err);

              // console.dir(results);
              // if(results.length > 3){
              //   results = [results[0],results[1],results[2]];
              // }

              for (let i = 0; i < results.length; i++) {

                const templateMessage = {
                  text: results[i]['title'] + "\n" + results[i]['link'],
                };

                const sendMsg = client.sendMessage(from, templateMessage);
                // m.reply(`${results[i]['link']}`);

              }



            });
          }
          catch (err) {
            console.log(util.format(err));
            m.reply("Sorry, there seems to be an error :" + err.message);
          }
          break;

        case 'meme': case "Meme":
          await memeHandler(client, text);
        case "imagine":
          await stableDiffusionApi(text);
          client.sendImage(from, image, text, mek);
          break;
        case "img": case "ai-img": case "image": case "images":
          await dalleHandeler(client, text);

          break;
        default: {
          if (isCmd2 && messageBody.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!messageBody.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("Command Not Found", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("Command Not Found", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});