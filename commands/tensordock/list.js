const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../tensordock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('使用できるserverのリストを表示します'),
    async execute(interaction) {
        const tensordock = new TensorDock();
        const servers = await tensordock.list();
        let text = '';
        for (const server of servers) {
            text += `id:${server} \n`;
        }

        await interaction.reply(`respoinse ${text}`);
    },
};

