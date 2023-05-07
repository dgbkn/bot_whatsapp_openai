const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
let setting = require("dotenv").config().parsed;

const { getMenu, textDavinci003, memeHandler, stableDiffusionApi, dalleHandler, ytApiHandler } = require("./commands");

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

    var condition = isCmd2;
    // var condition = isCmd2 && groupName == setting.group;

    if (condition) {
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
              console.log(error);
              m.reply("Sorry, there seems to be an error :" + error.message);
          }
          break;
        case "video": case "Video": case "yt":
          await ytApiHandler(client, text, from);
          break;
        case 'meme': case "Meme":
          await memeHandler(client,mek,from);
        case "imagine":
          var image = await stableDiffusionApi(text);
          client.sendImage(from, image, text, mek);
          break;
        case "img": case "ai-img": case "image": case "images":
          var image = await dalleHandler(text);
          client.sendImage(from, image, text, mek);
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


  } catch (err) {
    console.log(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});