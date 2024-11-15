const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverの詳細な情報を表示します'),
    async execute(interaction) {
        const tensordock = new TensorDock();
        const servers_map = await tensordock.list();
        const server_id = interaction.options.getString('server_id');
        const server_info = servers_map[server_id];
        // key: valueを返す
        const keys = Object.keys(server_info);
        let text = '';
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = server_info[key];
            text += `${key}: ${JSON.stringify(value)}\n`;
        }
        await interaction.reply({
            content: `${text}`,
            ephemeral: true,
        });
    },
};