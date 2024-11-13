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
        const res = await this.sendRequest(endpoint, param);
        if (res.success === false){
            return res.error;
        }
        return res.success;
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
    async bid_price (server_id, price){
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
        const res = await this.sendRequest(endpoint, param);
        if (res.success === false){
            return res.error;
        }
        return res.success;
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
    async detail (server_id){
        const endpoint = 'client/get/single';
        const param = {server: server_id};
        const res = await this.sendRequest(endpoint, param);
        if (res.success === false){
            return res.error;
        }
        // {
        //     "cost": 0.1,
        //     "hostname": "217.79.242.232",
        //     "hostnode": "8db2ec46-c094-4262-bc7e-6c76617f4237",
        //     "location": "d52421f8-b264-440f-b9fb-78e05f2af72f",
        //     "name": "test",
        //     "operating_system": "Ubuntu 22.04 LTS",
        //     "port_forwards": {
        //       "60098": "22"
        //     },
        //     "specs": {
        //       "gpu": {
        //         "amount": 8,
        //         "type": "v100-pcie-16gb"
        //       },
        //       "ram": 8,
        //       "storage": 100,
        //       "vcpus": 16
        //     },
        //     "status": "Outbid",
        //     "timestamp_creation": "Sun, 21 May 2023 16:18:35 GMT",
        //     "type": "spot"
        //   }
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
        // 成功化どうかを判定、成功ならresponseを返す
        try {
            console.log('sending request to:',api_url);
            const res = await axios.post(api_url, form, {
                headers: form.getHeaders(),
            });
            // resのtype
            // jsonの中の"success" keyを取得
            if (res.data.success === false){
                // console.log('error',res);
                return res.data;
            }
            console.log('success',res);
            // json自体を返す
            return res.data;
        } catch (error) {
            // errorの種類をしっかり場合分けしていく必要がある。
            // 1.axiousのエラー
            // 2.サーバー側のエラー
            // 3.リクエストが通らないエラー
            // stopがすでに止まっている場合などもここに入ってしまう
            // console.error('handling error',error);
            // console.log('error',error.response);
            // res.success = falseを返す
            return {success: false, error: error};
        }

    }
}

module.exports = {
    TensorDock,
}