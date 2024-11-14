const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstartします。'),
    async execute(interaction) {
        const tensordock = new TensorDock();
        const server_id = interaction.options.getString('server_id');
        // const server_info = await tensordock.detail(server_id);

        // // serverのinfoを取得
        // const start_param = {
        //     server_id: server_id,
        //     gpu_model: server_info.specs.gpu.type,
        //     gpu_count: 1,
        //     ram: 16,
        //     vcpus: 4,
        //     storage: server_info.specs.storage,
        // }
        // // modify
        // const modify_res = await tensordock.modify(start_param);
        // if (modify_res === false){
        //     await interaction.reply(`modifyに失敗しました。`);
        //     return;
        // }
        // start
        const res = await tensordock.start(server_id);
        if (res.success === false){
            await interaction.reply(`startに失敗しました。\n${res.error}`);
            return;
        }
        // sshで接続し、cd /var/www/cloneComfyUi/ docker compose up --detachを実行
        // 結果を待ち、成功したら返信
        const sshRes = await ssh.execute('cd /var/www/cloneComfyUi/ && docker compose up --detach');

        await interaction.reply(`startしました。\n\`\`\`${server_id}\`\`\``);
    },
};