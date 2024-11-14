const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
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
        const res = await tensordock.stop(server_id);
        if (res.success === false){
            // 管理者にメッセージを送信
            const user = await interaction.client.users.fetch(myDiscordId);
            const dashboardUrl = `https://dashboard.tensordock.com/manage/${server_id}/`;
            await user.send(`serverの停止に失敗しました。\n ${res.error} \n server_id: ${server_id}` + `\n dashboard: ${dashboardUrl}`);
            await interaction.reply(`stopに失敗しました。${res.error}`);
            return;
        }
        await interaction.reply(`stopしました。\n\`\`\`${server_id}\`\`\``);

    },
};