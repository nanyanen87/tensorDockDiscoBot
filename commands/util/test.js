const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
//curl --location 'https://marketplace.tensordock.com/api/v0/auth/test' \
// --form 'api_key=""' \
// --form 'api_token=""'
// curlでapiを叩いて結果を返すcommandを作成する
const api_url = 'https://marketplace.tensordock.com/api/v0/auth/test';
const api_key = process.env.TENSOR_DOCK_API_KEY;
const api_token = process.env.TENSOR_DOCK_API_TOKEN;

async function sendRequest(){
    const form = new FormData();
    form.append('api_key', api_key);
    form.append('api_token', api_token);

    try {
        const res = await axios.post(api_url, form, {
            headers: form.getHeaders(),
        });
        console.log('success',res.data);
        return res.data;
    } catch (error) {
        console.error('error',error);
        return error;
    }

}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test api'),
    async execute(interaction) {
        res = await sendRequest();
        await interaction.reply(`respoinse ${res}`);
    },
};

