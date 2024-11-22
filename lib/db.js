// db.js
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
class ServerDB {
    constructor() {
        const filePath = './db/db.json'; // index.jsからの相対パス
        console.log(filePath);
        this.adapter = new FileSync(filePath);
        this.db = low(this.adapter);

        // 初期化 (データが存在しない場合)
        this.db
            .defaults({ servers: {} })
            .write();
    }

    // サーバー情報の保存
    saveServer(id, serverInfo) {
        // idが存在しない場合は新規作成, 存在する場合は何もしない
        this.db
            .get('servers')
            .defaults({ [id]: serverInfo })
            .write();
        // this.db
        //     .get('servers')
        //     .set(id, serverInfo)
        //     .write();
    }

    // サーバー情報の取得
    getServer(id) {
        return this.db
            .get('servers')
            .value()[id];
    }

    hasServer(id) {
        return this.db
            .get('servers')
            .has(id)
            .value();
    }


    // 全てのサーバー情報の取得
    getAllServers() {
        return this.db
            .get('servers')
            .value();
    }

    // サーバー情報の削除
    deleteServer(id) {
        this.db
            .get('servers')
            .unset(id)
            .write
    }
}

module.exports = {
    ServerDB,
}