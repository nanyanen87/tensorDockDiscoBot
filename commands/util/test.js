const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const { TensorDock } = require('../../lib/tensordock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test api'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す
        const tensordock = new TensorDock();
        const serverId = ''
        const price = 11
        const res = await tensordock.bidPrice(serverId, price);
        console.log(res);
    },
};

