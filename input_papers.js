

'use strict';

var dappAddress = "n21MwJsNYUFTJX3gRinegwXeR3xgVw2gXin";
var InputPapers = function() {

}
InputPapers.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitPapers();
        });

        $("#price_title").hide();
        $("#papers_price_num").hide();

        $("#papers_need_price").change(function(){
            var price_type = $("#papers_need_price").val();
            if (price_type == "1") {
                $("#price_title").hide();
                $("#papers_price_num").hide();
            } else {
                $("#price_title").show();
                $("#papers_price_num").show();
            }
        });
    },

    commitPapers: function() {
        var papers_name = $("#papers_name").val();
        var papers_sex = $("#papers_sex").val();
        var papers_Type = $("#papers_Type").val();
        var papers_title = $("#paper_title").val();
        var papers_remark = $("#paper_remark").val();
        var papers_detail = $("#paper_detail").val();
        var papers_image = $("#papers_image").attr("src");
        var papers_time = getNowFormatDate();
        var select_need_price = $("#papers_need_price").val();
        var price_num = 0;
        var is_need_price = false;
        if (select_need_price == "1") {
            is_need_price = false;
        } else {
            is_need_price = true;
            price_num = parseFloat($("#papers_price_num").val());
        }
        var warning_note = "";
		
        if(papers_name == "") {
            warning_note = "您的姓名不能为空";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_sex == "") {
            warning_note = "请选择您的性别";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_Type == "") {
            warning_note = "请选择记忆类别";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_title == "") {
            warning_note = "请填写记忆标题";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_remark == "") {
            warning_note = "请填写记忆提示语";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_detail == "") {
            warning_note = "请填写详细小秘密";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        var length = papers_image.replace(/[^\u0000-\u00ff]/g,"aaa").length;
        console.log(length);
        if (length > 112400) {
            warning_note = "记忆图片太大，请选择小图片(小于128K)";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        
        // 提交
        var func = "add_papers_to_list";
        var req_arg_item = {
            "name": papers_name,
            "sex": papers_sex,
            "title": papers_title,
            "remarks": papers_remark,
            "type": papers_Type,
            "detail_content": papers_detail,
			"time" : papers_time,
            "image": papers_image,
            "timestamp": Date.parse(new Date()),
            "is_need_price": is_need_price,
            "price_num": price_num
        };
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
					$("#papers_input_warning").show();
					$("#papers_input_warning").text(obj.message);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    }
}
//获取当前时间
	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
		month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		+ " " + date.getHours() + seperator2 + date.getMinutes()
		+ seperator2 + date.getSeconds();
		return currentdate;
	}

var inputpapersObj;

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){
        //alert ("Extension wallet is not installed, please install it first.")
        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    inputpapersObj = new InputPapers();
    inputpapersObj.init();
    inputpapersObj.listenWindowMessage();
}



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#papers_input_warning").hide();
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    