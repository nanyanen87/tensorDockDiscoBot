const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const myDiscordId = process.env.MY_DISCORD_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstopします。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: true }); // まず応答を返す

        const tensordock = new TensorDock();
        const serverId = interaction.options.getString('server_id');
        const serverInfo = await tensordock.detail(serverId);
        const stopParam = {
            server: serverInfo.hostnode,
            gpu_model: serverInfo.specs.gpu.type,
            gpu_count: 0,
            ram: 1,
            vcpus: 2,
            storage: serverInfo.specs.storage,
        }

        const stopRes = await tensordock.stop(serverId);
        if (stopRes.success === false){
            // サーバーの停止に失敗した場合
            console.log(`serverの停止に失敗しました。serverId: ${serverId}`);
            console.log(stopRes.error);
            // 管理者にメッセージを送信
            const user = await interaction.client.users.fetch(myDiscordId);
            const dashboardUrl = `https://dashboard.tensordock.com/manage/${serverId}/`;
            await user.send(`serverの停止に失敗しました。\n ${stopRes.error} \n serverId: ${serverId}` + `\n dashboard: ${dashboardUrl}`);
            await interaction.followUp(`stopに失敗しました。${stopRes.error}`);
            return;
        } else {
            // サーバーは停止している
            await interaction.followUp(`serverを停止してします...リソースを解放します。`);
            // リソースを開放する
            const modifyRes = await tensordock.modify(stopParam);
            if (modifyRes.success === true){
                await interaction.followUp(`リソースを解放しました。\n\`\`\`${serverId}\`\`\``);
                return;
            } else {
                // 開放に失敗した場合
                // 管理者にメッセージを送信
                // const user = await interaction.client.users.fetch(myDiscordId);
                // const dashboardUrl = `https://dashboard.tensordock.com/manage/${serverId}/`;
                // await user.send(`リソースの解放に失敗しました。\n ${modifyRes.error} \n serverId: ${serverId}` + `\n dashboard: ${dashboardUrl}`);
                await interaction.followUp(`リソースの解放に失敗しました。${modifyRes.error}`);
                return;
            }
        }
    },
};

