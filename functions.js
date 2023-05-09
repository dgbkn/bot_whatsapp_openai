let setting = require("dotenv").config().parsed ?? process.env;
const { Configuration, OpenAIApi } = require("openai");
const axios = require('axios');
const cheerio = require('cheerio');
const util = require("util");
const GPT3Tokenizer = require("gpt3-tokenizer");
const Chat = require("./models/Chat");

const youtubesearchapi = require("youtube-search");
const chalk = require("chalk");


function getMenu(prefix) {
    return `*Whatsapp MLSC Bot*
Ask anything to AI
Cmd:${prefix}bot
Give reply
Example: ${prefix}bot what is nlp

Cmd:${prefix}meme
Give A Random meme
Example: ${prefix}meme 

*(MIDJOURNEY)*
Cmd:${prefix}imagine
Give a image based on query from midjounery
Example: ${prefix}imagine sunshine days

Cmd:${prefix}video
Give a video based on query
Example: ${prefix}video give me some sunshine

*(DALL-E)*
Cmd: ${prefix}img
Create an image from text`;
}


async function textDavinci003(prompt) {
    if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") {
        return;
    }

    if (!prompt) return `Chat with AI.\n\nExample:\n /bot What is recession`;
    const configuration = new Configuration({
        apiKey: setting.keyopenai,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0, // Higher values means the model will take more risks.
        max_tokens: 1024, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        top_p: 1, // alternative to sampling with temperature, called nucleus sampling
        frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
        presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    return `${response.data.choices[0].text}`;
}


async function stableDiffusionApi(prompt) {
    const response = await axios.post(
        'https://stablediffusionapi.com/api/v3/dreambooth',
        {
            'key': setting.stablediffusionkey,
            'model_id': 'midjourney',
            // 'prompt': prompt  + ", Unreal Engine 5, Octane Render, Redshift, ((cinematic lighting)), f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame",             
            'prompt': prompt + ",art by midjourney,cgi",
            'negative_prompt': '',
            'width': '512',
            'height': '512',
            'samples': '1',
            'num_inference_steps': '20',
            'seed': null,
            'guidance_scale': 7.5,
            'safety_checker': 'yes',
            'webhook': null,
            'track_id': null
        },
        {
            headers: {
                'Content-type': 'application/json'
            }
        }
    );

    var image = response["data"]["output"][0];
    return image;
}


async function memeHandler(client, mek, from) {
    try {


        const no = Math.floor(Math.random() * 3);

        if (no == 1) {
            const response = await axios.post(
                'https://mememandir.com/PostService.asmx/GetPostData',
                new URLSearchParams({
                    'pageNumber': `${Math.floor(Math.random() * 10)}`,
                    'pageSize': '6'
                }),
            );
            var resp = response["data"];

            await client.sendMessage(
                from,
                { video: { url: "https://mememandir.com/" + resp[0]["VideoLink"] }, mimetype: 'video/mp4', caption: resp[0]["Title"], }
                // gifPlayback: true
            );

        } else if (no == 2) {
            var re = await axios.get("https://meme-api.com/gimme");
            re = re["data"];
            client.sendImage(from, re["url"], re["title"], mek);

        } else {
            const memedata = await axios.get("https://memes.co.in/?random=1");
            var meme = memedata["data"];
            const $ = cheerio.load(meme);
            var dat = $('body > main > div.infini-column > section:nth-child(1) > article > div.video-wrapper.vxplayer > div.vx_el').attr('src');
            var header = $('body > main > div.infini-column > section:nth-child(1) > article > h1').text();
            dat = "https://memes.co.in/" + dat;


            await client.sendMessage(
                from,
                { video: { url: dat }, mimetype: 'video/mp4', caption: header, }
                // gifPlayback: true
            );

            console.log(dat + header);
        }
    } catch (err) {
        console.log(util.format(err));
    }

}


async function dalleHandler(prompt, m) {
    try {
        if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") {
            return;
        }

        if (!prompt) return `Generate Image with AI.\n\nExample:\n /img beautiful nature`;
        const configuration = new Configuration({
            apiKey: setting.keyopenai,
        });
        const openai = new OpenAIApi(configuration);
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512",
        });
        return response.data.data[0].url;
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            var errMsg = error.response.data.error.message;
            m.reply("Sorry, there seems to be an error :" + errMsg);
          } else {
            console.log(error.message);
            m.reply("Sorry, there seems to be an error :" + error.message);
          }
    }
}



async function ytApiHandler(client, text, from, m) {
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
            }
        });
    }
    catch (err) {
        console.log(util.format(err));
        m.reply("Sorry, there seems to be an error :" + err.message);
    }
}


async function generateSummaryRecursively(prompt, prev_summary = "") {
    splitted_prompt = prompt.split("\n");
    var final_prompt = prev_summary === "" ? `Summarize the following conversation: \n` : `Summarize the following Summary of conversation:${prev_summary}\nwith further conversation:\n`;
    var tokens = calculateGptTokens(final_prompt);
    var remaning_prompts = [];
    splitted_prompt.forEach(prompt => {
        var curr_tokens = calculateGptTokens(prompt);
        if ((tokens + curr_tokens) < 3000) {
            tokens += curr_tokens;
            final_prompt += prompt;
        } else {
            remaning_prompts.push(prompt);
        }
    });

    console.log(final_prompt);
    var summary = await textDavinci003(final_prompt);
    if (remaning_prompts.length > 2) {
        return generateSummaryRecursively(remaning_prompts.join("\n"), summary);
        // return await generateSummaryRecursively(remaning_prompts.join("\n"),summary);
    }
    return summary;
}


function calculateGptTokens(body) {
    const tokenizer = new GPT3Tokenizer.default({ type: 'gpt3' });
    const encoded = tokenizer.encode(body);
    const length = encoded.bpe.length;
    return length;
}

async function summaryHandler(groupMetadata, m) {
    try {
        var participants = groupMetadata.participants;
        var senderId = m.sender;
        var currentSender = participants.filter(participant => {
            return participant.id === senderId;
        });
        
        console.log("Current Sender:");
        currentSender = currentSender[0];
        console.log(currentSender);

        if (!(currentSender.admin == "admin" || currentSender.admin == "superadmin")) {
            m.reply(`You must be an admin to use this command`);
            return;
        }
        const msgs = await Chat.findAll();
        if (msgs.length < 2) {
            m.reply("more than 2 messages should be there to continue");
            return;
        }
        var summary = ``;
        msgs.forEach(async (msg) => {
            msg.body = msg.body.replaceAll("\n", "");
            const dateFormat = new Date(msg.createdAt);
            const timeOfMsg = formatAMPM(dateFormat);
            summary += `From:'${msg.pushName}',body:'${msg.body}' \n`;
        });
        var chat_gpt_resp = await generateSummaryRecursively(summary);

        //sending Summary to group:
        m.reply(chat_gpt_resp);

        //logs:
        console.log(chalk.red(summary), chalk.green("\n\nGenerated Summary:" + chat_gpt_resp));
    }
    catch (err) {
        console.log(util.format(err));
        m.reply("Sorry, there seems to be an error :" + err.message);
    }
}

module.exports = { getMenu, textDavinci003, stableDiffusionApi, memeHandler, stableDiffusionApi, dalleHandler, ytApiHandler,summaryHandler, calculateGptTokens, generateSummaryRecursively };