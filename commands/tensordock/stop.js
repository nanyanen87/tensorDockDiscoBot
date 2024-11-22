const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const {ServerDB} = require("../../lib/db");
const myDiscordId = process.env.MY_DISCORD_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstopします。'),
    async execute(interaction, serverId = null) {
        if (interaction.replied || interaction.deferred) {

        } else {
            interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す
        }

        const tensordock = new TensorDock();
        // serverIdが指定されていない場合はinteractionから取得
        if (serverId === null){
            serverId = interaction.options.getString('server_id');
        }
        // db　にidがあるか確認し、あればそこから取得なければtensordockから取得
        const serverDB = new ServerDB();
        let serverInfo;
        if (!serverDB.hasServer(serverId)){
            serverInfo = await tensordock.detail(serverId);
            serverDB.saveServer(serverId, serverInfo);
        } else {
            serverInfo = serverDB.getServer(serverId);
        }
        console.log(serverInfo);
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
            await interaction.followUp({
                content: `serverの停止に失敗しました。${stopRes.error}`,
                ephemeral: false,
            });
            return;
        } else {
            // サーバーは停止している
            await interaction.followUp(`serverを停止しました！\n\`\`\`${serverId}\`\`\``);
            // dbの情報を削除
            serverDB.deleteServer(serverId);

            // リソースを開放する //todo apiが壊れているためコメントアウト
            // const modifyRes = await tensordock.modify(stopParam);
            // if (modifyRes.success === true){
            //     await interaction.followUp({
            //         content: `serverを停止しました...リソースを解放しました。\n\`\`\`${serverId}\`\`\``,
            //         ephemeral: false,
            //     });
            //     return;
            // } else {
            //     // 開放に失敗した場合
            //     // 管理者にメッセージを送信
            //     // const user = await interaction.client.users.fetch(myDiscordId);
            //     // const dashboardUrl = `https://dashboard.tensordock.com/manage/${serverId}/`;
            //     // await user.send(`リソースの解放に失敗しました。\n ${modifyRes.error} \n serverId: ${serverId}` + `\n dashboard: ${dashboardUrl}`);
            //     await interaction.followUp({
            //         content: `リソースの解放に失敗しました。${modifyRes.error}`,
            //         ephemeral: false,
            //     });
            //     return;
            // }
        }
    },
};

