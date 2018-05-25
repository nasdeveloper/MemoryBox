

// 转换接口，界面测调用js_back中的函数，均通过这里做转换，采用发送message的方式进行
var TranslateObj = function() {
    this.papersObj = new PapersSys();
    this.papersObj.init();
}

TranslateObj.prototype = {
    addListenerFromUI: function() {
        var self = this;
        window.addEventListener('message', function(e) {

            if(e.data.target === "contentscript_j") {
                // 收到发送过来的请求
                var method_type = e.data.method;
                var call_data = e.data.data;
                if(call_data == null ) {
                    console.log("error , no input data object");
                    return;
                }
                if (call_data.contract == null) {
                    console.log("error, no contract data object");
                    return;
                }
                var func_name = call_data.contract.function;
                // 传入参数是一个数组，每个位放置一个参数
                var arg_list_s = call_data.contract.args;
                var arg_list = [];
                if (arg_list_s != "") {
                    arg_list = JSON.parse(arg_list_s);
                }

                if(method_type == "neb_call") {
                    // 查看
                    self.doNebCallFun(func_name, arg_list);
                } else if(method_type == "neb_sendTransaction") {
                    // 修改和新增
                    self.doSendTransaction(func_name, arg_list);
                }
            }
        
        });
    },

	//调用方法 如query_papers_by_key
    doNebCallFun: function(func_name, arg_list) {
        var self = this;
        var ret_data;
        if(func_name == "query_my_papers") {
            // 调用add_papers_to_list方法
            ret_data = self.papersObj.query_my_papers();
        } else if(func_name == "query_papers_by_id") {
            ret_data = self.papersObj.query_papers_by_id(arg_list[0]);
        } else if(func_name == "query_papers_by_key") {
            ret_data = self.papersObj.query_papers_by_key(arg_list[0]);
        }
        // 发送结果出去
        window.postMessage({
            "data":{
                "neb_call": {
                    "result" : JSON.stringify(ret_data)
                },
            }
        }, "*");
    },

    doSendTransaction: function(func_name, arg_list) {
        var self = this;
		var ret_data;
        if (func_name == "add_papers_to_list") {
            // 调用add_papers_to_list方法
            ret_data=self.papersObj.add_papers_to_list(arg_list[0]);
        } else if(func_name == "add_papers_evaluation") {
            ret_data=self.papersObj.add_papers_evaluation(arg_list[0]);
        }
		 // 发送结果出去
        window.postMessage({
            "data":{
                "neb_call": {
                    "result" : JSON.stringify(ret_data)
                },
            }
        }, "*");
    },
}

var translateObj = new TranslateObj();
translateObj.addListenerFromUI();
