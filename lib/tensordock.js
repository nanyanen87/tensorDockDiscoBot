// paramとendpointをうけとってurlを返すmodule
const axios = require('axios');
const FormData = require('form-data');
const api_base_url = 'https://marketplace.tensordock.com/api/v0/';
const api_key = process.env.TENSOR_DOCK_API_KEY;
const api_token = process.env.TENSOR_DOCK_API_TOKEN;
class TensorDock {
    constructor() {
    }

    // booleanを返す
    async test (param){
        const endpoint = 'auth/test';
        const res = await this.sendRequest(endpoint, param);
        // success keyを取得
        if (res.success === false){
            return res.error;
        }
        return res.success;
    }

    // booleanを返す
    async start (server_id){
        const endpoint = 'client/start/single';
        const param = {server: server_id};
        return await this.sendRequest(endpoint, param);
    }

    // booleanを返す
    async stop (server_id){
        const endpoint = 'client/stop/single';
        const param = {
            server: server_id,
            disassociate_resources: "true", // gpuを解放する
        };
        return await this.sendRequest(endpoint, param);
    }

    // booleanを返す
    async bidPrice (server_id, price){
        const endpoint = 'client/spot/validate/existing';
        const param = {server: server_id, price: price};
        const res = await this.sendRequest(endpoint, param);
        if (res.success === false){
            return res.error;
        }
        const success = res.success;
        return res.success

    }

    // --data-urlencode 'server_id=cb3c501e-b85c-473d-9ab1-04dbb3e28450' \
    // --data-urlencode 'gpu_model=rtxa6000-pcie-48gb' \
    // --data-urlencode 'gpu_count=1' \
    // --data-urlencode 'ram=16' \
    // --data-urlencode 'vcpus=2' \
    // --data-urlencode 'storage=80'
    // startとstop時に使用する
    async modify (param){
        const endpoint = 'client/modify/single';
        return await this.sendRequest(endpoint, param);
    }

    // server_mapをjsonで返す
    async list (){
        const endpoint = 'client/list';
        const res = await this.sendRequest(endpoint, {});
        if (res.success === false){
            return res.error;
        }
        // {server_id1: {id: server_id1, name: server_name1}, server_id2: {id: server_id2, name: server_name2}}
        return res.virtualmachines;
    }

    // server_infoをjsonで返す
    async detail (serverId){
        const endpoint = 'client/get/single';
        const param = {server: serverId};
        const res = await this.sendRequest(endpoint, param);
        if (res.success === false){
            return res.error;
        }
        return res.virtualmachines;
    }

    // 共通の最終リクエスト: jsonObjectを返す
    async sendRequest(endpoint, param){
        const form = new FormData();
        // param {key: value}をformに追加
        for (const [key, value] of Object.entries(param)) {
            form.append(key, value);
        }
        form.append('api_key', api_key);
        form.append('api_token', api_token);
        const api_url = api_base_url + endpoint;
        // todo ここではstatus codeで判定する
        try {
            // console.log('sending request to:',api_url);
            const res = await axios.post(api_url, form, {
                headers: form.getHeaders(),
            });
            // resのtype
            // jsonの中の"success" keyを取得
            if (res.data.success === false){
                // console.log('error',res);
                return res.data;
            }
            // console.log('success',res);
            // json自体を返す
            return res.data;
        } catch (error) {
            switch (error.response.status) {
                case 404:
                    console.error('404 error',error.response.statusText);
                    break;
                case 500:
                    console.error('500 error',error.response.statusText);
                        // なぜかすでに止まっている場合500が返ってくるためhandleする
                    if (error.response.data.error === "Machine is stoppeddisassociated, therefore it cannot be stopped"){
                        return {success: true, error: "Machine is stoppeddisassociated, therefore it cannot be stopped"};
                        // すでに起動している場合500が返ってくるためhandleする
                    } else if (error.response.data.error === "Machine is running, therefore it cannot be started"){
                        return {success: true, error: "Machine is running, therefore it cannot be started"};
                    }
                    break;
                default:
                    console.error('default error',error.response.statusText);
                    break;
            }
            return {success: false, error: error};
        }
    }

}

module.exports = {
    TensorDock,
    getSshParam: function (serverInfo){
        const sshHost = serverInfo.ip_address;
        const ports = serverInfo.port_forwards;
        // ports{global_port: local_port, ...}の中でlocal_portが22のglobal_portを取得
        const sshPort = Object.keys(ports).find(key => ports[key] === '22');
        return {
            host: sshHost,
            port: sshPort,
        }
    }
}