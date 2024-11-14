const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstartします。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: true }); // まず応答を返す

        const tensordock = new TensorDock();
        const server_id = interaction.options.getString('server_id');
        const serverInfo = await tensordock.detail(server_id);
        const startParam = {
            server: serverInfo.hostnode,
            gpu_model: serverInfo.specs.gpu.type,
            gpu_count: 1,
            ram: 16,
            vcpus: 4,
            storage: serverInfo.specs.storage,
        }
        //　リソースの取得
        await tensordock.modify(startParam);
        if (res.success === false){
            await interaction.reply(`リソースの取得に失敗しました。\n${res.error}`);
            return;
        }

        // start
        const res = await tensordock.start(server_id);
        if (res.success === false){
            await interaction.reply(`startに失敗しました。\n${res.error}`);
            return;
        }
        // sshで接続し、cd /var/www/cloneComfyUi/ docker compose up --detachを実行
        // 長時間かかる処理

        const ssh = new SshClient();
        await ssh.connect();
        await ssh.disconnect();
        const sshRes = await ssh.execute('cd /var/www/cloneComfyUi/ && docker compose up --detach');

        await interaction.reply(`startしました。\n\`\`\`${server_id}\`\`\``);
    },
};