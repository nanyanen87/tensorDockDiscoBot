const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-comfyui')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('docker psを実行します。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す

        const tensordock = new TensorDock();
        const server_id = interaction.options.getString('server_id');
        // todo server_idからsshのhostとportを取得する必要がある。
        // start

        const ssh = new SshClient();
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