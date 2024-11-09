// paramとendpointをうけとってurlを返すmodule
const axios = require('axios');
const FormData = require('form-data');
const api_base_url = 'https://marketplace.tensordock.com/api/v0/';
const api_key = process.env.TENSOR_DOCK_API_KEY;
const api_token = process.env.TENSOR_DOCK_API_TOKEN;
class TensorDock {
    constructor() {
    }


    async test (param){
        const endpoint = 'auth/test';
        const responseJson = await this.sendRequest(endpoint, param);
        // success keyを取得
        const success = responseJson.success;
        return responseJson;
    }

    async list (param){
        const endpoint = 'client/list';
        const res = await this.sendRequest(endpoint, param);
        if (res === false){
            return false;
        }
        // serverの配列を返す{server_id1: {id: server_id1, name: server_name1}, server_id2: {id: server_id2, name: server_name2}}
        const servers = res.virtualmachines;
        // keyの配列を取得
        return Object.keys(servers);
    }

    // 共通の最終リクエスト: jsonObjectを返す
    async sendRequest(endpoint, param){
        const form = new FormData();
        form.append('api_key', api_key);
        form.append('api_token', api_token);
        const api_url = api_base_url + endpoint;
        // 成功化どうかを判定、成功ならresponseを返す
        try {
            const res = await axios.post(api_url, form, {
                headers: form.getHeaders(),
            });
            // resのtype
            // jsonの中の"success" keyを取得
            if (res.data.success === false){
                console.log('error',res.data);
                return false;
            }
            console.log('success',res.data);
            // json自体を返す
            return res.data;
        } catch (error) {
            console.error('error',error);
            return false
        }

    }
}

module.exports = {
    TensorDock,
}