const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('extend')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverを１時間延長します。'),
    async execute(interaction) {
        const serverId = interaction.options.getString('server_id');
        interaction.reply({ content: `\n\`\`\`${serverId}\`\`\`１時間延長しました！`, ephemeral: false }); // まず応答を返す
    },
};
