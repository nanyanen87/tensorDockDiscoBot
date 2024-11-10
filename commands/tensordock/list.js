const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../tensordock.js');
// server_name [status: $status]を返す
module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('使用できるserverのリストを表示します'),
    async execute(interaction) {

        const tensordock = new TensorDock();
        const serversMap = await tensordock.list();
        const serverIds = Object.keys(serversMap);
        let text = '';
        // serverId: 稼働中/停止中
        for (let i = 0; i < serverIds.length; i++) {
            const serverId = serverIds[i];
            const status = serversMap[serverId].status;
            text += `\n\`\`\`${serverId}\`\`\`: ${status}\n`;
        }

        await interaction.reply(`${text}`);
    },
};

