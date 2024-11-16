const fs = require('node:fs')
const path = require('node:path');
const { Client } = require('ssh2');
const host = process.env.SSH_HOST;
const port = process.env.SSH_PORT;
const username = process.env.SSH_USER;
const keyPath = path.join(process.env.HOME, process.env.RELATIVE_SSH_KEY_PATH);

class SshClient {
    // todo host,portは引数で受け取るようにする
    constructor() {
        this.config = {
            host: host,
            port: port,
            username: username,
            privateKey: fs.readFileSync(keyPath, { encoding: 'utf8' }),
            keepaliveInterval: 1000,
        }
        this.client = new Client();
    }

    // SSH接続を開始する
    connect() {
        return new Promise((resolve, reject) => {
            this.client.on('ready', () => {
                console.log('SSH接続が確立しました');
                resolve();
            }).on('error', (err) => {
                reject(`SSH接続エラー: ${err.message}`);
            }).connect(this.config);
        });
    }

    // コマンドを実行する
    execute(command) {
        return new Promise((resolve, reject) => {
            this.client.exec(command, (err, stream) => {
                if (err) {
                    reject(`コマンド実行エラー: ${err.message}`);
                    this.client.end();
                    return;
                }

                let output = '';
                let errorOutput = '';

                stream.on('data', (data) => {
                    output += data.toString();
                }).on('stderr', (data) => {
                    errorOutput += data.toString();
                }).on('close', (code, signal) => {
                    if (code === 0) {
                        resolve({ output, code, signal });
                    } else {
                        reject({ error: errorOutput, code, signal });
                    }
                    this.client.end();
                });
            });
        });
    }

    // SSH接続を終了する
    disconnect() {
        this.client.end();
    }
}

module.exports = {
    SshClient,
};

