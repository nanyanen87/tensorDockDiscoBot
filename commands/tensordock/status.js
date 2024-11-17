const { SlashCommandBuilder } = require('discord.js');
const { TensorDock,getSshParam } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");
const {ServerDB} = require("../../lib/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-comfyui')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('docker psを実行します。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す

        const tensordock = new TensorDock();
        const server_id = interaction.options.getString('server_id');
        // db　にidがあるか確認し、あればそこから取得なければtensordockから取得
        const serverDB = new ServerDB();
        let serverInfo;
        if (!serverDB.hasServer(server_id)){
            serverInfo = await tensordock.detail(server_id);
            serverDB.saveServer(server_id, serverInfo);
        } else {
            serverInfo = serverDB.getServer(server_id);
        }
        const param = getSshParam(serverInfo);
        console.log(param.port);
        console.log(param.host);
        const ssh = new SshClient(param);
        await ssh.connect();
        const sshRes = await ssh.execute('export PATH=$PATH:/usr/bin && cd /var/www/MyComfyUI/ && docker ps');
        // const sshRes = await ssh.execute('export PATH=$PATH:/usr/bin && cd /var/www/MyComfyUI/ && docker compose up');
        console.log(sshRes);
        await ssh.disconnect();
        const res = JSON.stringify(sshRes);
        await interaction.followUp({
            content: `docker psを実行しました。\n\`\`\`${res}\`\`\``,
            ephemeral: false
        })
    },
};