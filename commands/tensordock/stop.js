const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../tensordock.js');
const myDiscordId = process.env.MY_DISCORD_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstopします。'),
    async execute(interaction) {
        const tensordock = new TensorDock();
        const server_id = interaction.options.getString('server_id');
        // const server_info = await tensordock.detail(server_id);
        // const stop_param = {
        //     server: server_id,
        //     gpu_model: server_info.specs.gpu.type,
        //     gpu_count: 0,
        //     ram: 1,
        //     vcpus: 2,
        //     storage: server_info.specs.storage,
        // }
        // // modify
        // const modify_res = await tensordock.modify(stop_param);
        // if (modify_res === false){
        //     await interaction.reply(`modifyに失敗しました。`);
        //     return;
        // }
        // stop
        const stopRes = await tensordock.stop(server_id);
        if (stopRes === false){
            // クライアントから指定したユーザーを取得
            const user = await interaction.client.users.fetch(myDiscordId);
            const tensorDockUrl = 'https://dashboard.tensordock.com/list'
            await user.send(`serverの停止二失敗しました。\n server_id: ${server_id} \n${tensorDockUrl}`);
            await interaction.reply(`stopに失敗しました。\n 管理者にメッセージを送信しました。`);
            return;
        }
        await interaction.reply(`stopしました。`);
    },
};