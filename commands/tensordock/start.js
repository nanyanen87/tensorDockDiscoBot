const { SlashCommandBuilder } = require('discord.js');
const { TensorDock,getSshParam } = require('../../lib/tensordock.js');
const {SshClient} = require("../../lib/ssh");
const {ServerDB} = require("../../lib/db");
const comfyuiDomain = process.env.COMFYUI_DOMAIN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .addStringOption(option => option.setName('server_id').setDescription('server_id').setRequired(true))
        .setDescription('serverをstartします。'),
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
        const res = await tensordock.start(serverId);
        if (res.success === false){
            await interaction.followUp({
                content: `startに失敗しました。\n${res.error}`,
                ephemeral: false,
            });

            return;
        }
        await interaction.followUp(
            {
                content: `serverがstartしました...start-comfyuiコマンドを実行してください。\n\`\`\`${serverId}\`\`\``,
                ephemeral: false
            }
        );
        // systemdで起動するからいらない↓

        // // sshで接続し、cd /var/www/cloneComfyUi/ docker compose up --detachを実行
        // const param = getSshParam(serverInfo);
        // const ssh = new SshClient(param);
        // await ssh.connect();
        //  comfyuiの起動を確認
        //
        // const resDockerPs = await ssh.execute('ps aux | grep python3');
        // // outputにmain.pyという文字列があれば起動していると判断
        // if (resDockerPs.output.includes('main.py')){
        //     await interaction.followUp({
        //         content: `comfyUiはすでに起動しています。https://${comfyuiDomain}\n`,
        //         ephemeral: false
        //     });
        //     return;
        // }
        // //
        // const sshRes = await ssh.execute('export PATH=$PATH:/usr/bin && nohup python3 /var/www/myComfyUI/ComfyUI/main.py --detach > /dev/null 2>&1 &'); // backgroundで実行
        // console.log(sshRes);
        // await ssh.disconnect();
        //
        // await interaction.followUp({
        //     content: `comfyUiを起動しました。https://${comfyuiDomain}`,
        //     ephemeral: false
        // });
    },
};