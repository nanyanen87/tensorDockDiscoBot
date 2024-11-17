const { SlashCommandBuilder } = require('discord.js');
const { TensorDock,getSshParam } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");
const {ServerDB} = require("../../lib/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstartします。'),
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

        // const startParam = {
        //     server: serverInfo.hostnode,
        //     gpu_model: serverInfo.specs.gpu.type,
        //     gpu_count: 1,
        //     ram: 16,
        //     vcpus: 4,
        //     storage: serverInfo.specs.storage,
        // }
        // //　リソースの取得
        // await tensordock.modify(startParam);
        // if (res.success === false){
        //     await interaction.reply(`リソースの取得に失敗しました。\n${res.error}`);
        //     return;
        // }


        // start
        const res = await tensordock.start(server_id);
        if (res.success === false){
            await interaction.followUp({
                content: `startに失敗しました。\n${res.error}`,
                ephemeral: false,
            });

            return;
        }
        await interaction.followUp(
            {
                content: `startしました...comfyUiを起動します...`,
                ephemeral: true
            }
        );

        // sshで接続し、cd /var/www/cloneComfyUi/ docker compose up --detachを実行
        const param = getSshParam(serverInfo);
        const ssh = new SshClient(param);
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