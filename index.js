// Require the necessary discord.js classes
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'dev';
dotenv.config({path: `./.env.${env}`});


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// 環境
const token = process.env.DISCORD_TOKEN;

const client = new Client(
    { intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    }
);

// commandのデプロイ

if (env === 'prod') {
    require('./deploy-commands.js');
}



// hello world
client.on('messageCreate', message => {
    if(message.author.bot) return; //BOTのメッセージには反応しない

    if(message.content === "こんにちわ") {
        message.channel.send("こんにちわ！");
    }
});


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}


// serverの情報を保持する変数、serverId->isRunning,timerId

const timers = new Map();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    const timeLimit = 1000 * 60 * 60; // 1時間
    // startから一定時間でstopで実行する
    if (interaction.commandName === 'start') {
        const serverId = interaction.options.getString('server_id');
        clearTimeout(timers.get(serverId));
        const timerId = setTimeout(() => {
            // 引数にserverIdを渡してstopコマンドを実行
            client.commands.get('stop').execute(interaction,serverId)
        }, timeLimit); // 1時間後
        timers.set(serverId, timerId);
    } else if (interaction.commandName === 'stop') {
        const serverId = interaction.options.getString('server_id');
        clearTimeout(timers.get(serverId));
    } else if (interaction.commandName === 'extend') {
        // timersから起動中のserverIdを取得
        const serverId = interaction.options.getString('server_id');
        const timerId = timers.get(serverId);
        // 1時間延長
        clearTimeout(timerId);
        const newTimerId = setTimeout(() => {
            client.commands.get('stop').execute(interaction,serverId)
                .then(() => console.log('サーバーを自動停止しました。'))
                .catch(error => console.error('サーバーの自動停止に失敗しました。', error));
        }, timeLimit); // 1時間後
        timers.set(serverId, newTimerId);
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});


// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

