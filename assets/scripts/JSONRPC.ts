export class JSONRPC {

    id: number = 0;
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    ajax(method: string, data: any) {
        return new Promise((resolve, reject) => {
            this.id++;
            data = Object.assign({ jsonrpc: "2.0", id: this.id }, data);
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'json';// 指定返回类型

            xhr.onload = () => {
                switch (xhr.status) {
                    case 200: resolve(xhr.response); break;
                    case 204: resolve(""); break;
                    case 401:// 401登录失败处理
                        //do something
                        reject();
                        break;
                    default: reject({ status: xhr.status, res: xhr.response });
                }
            };
            if (data) {
                data = JSON.stringify(data);
            }
            xhr.open(method, this.url, true);
            xhr.setRequestHeader('Content-type', 'application/json');// 设置content-type
            // xhr.withCredentials = true;// 支持跨域发送cookies
            xhr.send(data);
        });
    }

    request(data: any) {
        return new Promise((resolve, reject) => {
            this.ajax("POST", data).then((value: any) => {
                resolve(value.result);
            }).catch((reason: any) => {
                console.log(reason)
                reject(reason);
            });
        });
    }


}