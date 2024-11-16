const { SlashCommandBuilder } = require('discord.js');
const { TensorDock } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-comfyui')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('docker psを実行します。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す


        // start
        const ssh = new SshClient();
        await ssh.connect();
        const sshRes = await ssh.execute('export PATH=$PATH:/usr/bin && cd /var/www/MyComfyUI/ && nohup docker compose up --detach > /dev/null 2>&1 &'); // backgroundで実行
        // const sshRes = await ssh.execute('export PATH=$PATH:/usr/bin && cd /var/www/MyComfyUI/ && docker compose up');
        console.log(sshRes);
        await ssh.disconnect();

        await interaction.followUp({
            content: `comfyUiを起動しました。\n\`\`\`comfyui.nanyanen.net\`\`\``,
            ephemeral: false
        });
    },
};