const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const { ServerDB } = require('../../lib/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverの詳細な情報を表示します'),
    async execute(interaction) {
        const tensordock = new TensorDock();

        const serverId = interaction.options.getString('server_id');
        // db　にidがあるか確認し、あればそこから取得なければtensordockから取得
        const serverDB = new ServerDB();
        let serverInfo;
        if (!serverDB.hasServer(serverId)){
            serverInfo = await tensordock.detail(serverId);
            serverDB.saveServer(serverId, serverInfo);
        } else {
            serverInfo = serverDB.getServer(serverId);
        }

        // key: valueを返す
        const keys = Object.keys(serverInfo);
        let text = '';
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = serverInfo[key];
            text += `${key}: ${JSON.stringify(value)}\n`;
        }
        await interaction.reply({
            content: `${text}`,
            ephemeral: true,
        });
    },
};