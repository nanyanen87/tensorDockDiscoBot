const { SlashCommandBuilder } = require('discord.js');
const { TensorDock,getSshParam } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");
const {ServerDB} = require("../../lib/db");
const comfyuiDomain = process.env.COMFYUI_DOMAIN;
const comfyuiPath = process.env.COMFYUI_PATH;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-comfyui')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('comfyuiの状態を確認します。'),
    async execute(interaction) {
        interaction.reply({ content: '処理中...', ephemeral: false }); // まず応答を返す

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
        const param = getSshParam(serverInfo);
        const ssh = new SshClient(param);
        await ssh.connect();

        // main.py version
        const sshRes = await ssh.execute('ps aux | grep main.py');
        const isRunning = sshRes.output.includes('main.py');

        // docker container version
        // const sshRes = await ssh.execute('docker ps');
        // const isRunning = sshRes.output.includes('mycomfyui');

        await ssh.disconnect();

        // outputにmycomfyuiという文字列があれば起動していると判断
        if (isRunning){
            await interaction.followUp({
                content: `comfyUiはすでに起動しています。https://${comfyuiDomain}\n`,
                ephemeral: false
            });
            return;
        }
        const res = JSON.stringify(sshRes);
        await interaction.followUp({
            content: `comfyuiは起動していません、startコマンドを実行してください。\n\`\`\`${res}\`\`\``,
            ephemeral: false
        })
    },
};