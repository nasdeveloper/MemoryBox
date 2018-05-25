

'use strict';

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var dappAddress = "n21MwJsNYUFTJX3gRinegwXeR3xgVw2gXin";
var PapersShow = function() {
	this.picTrans = new PictureSaveAndRead();
    this.picTrans.init();
}
PapersShow.prototype = {

    init: function() {
        var self = this;

        $("#search_myself").click(function() {
            $("#loader_paper").show();
            self.doSearchMySelf();
        });

        $("#commit_search").click(function() {
            self.doSearchByAddress();
        });
        
		$('.login5 a').click(function(){
			$('.box2').hide();
		});
    },

    doSearchMySelf: function() {
        // 查询我的信息
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_my_papers",
                    "args" : ""
                }
            },
            "method": "neb_call"
        }, "*");
    },

    doSearchByAddress: function() {
        var address = $("#search_key_input").val();
        var req_args = [];
        req_args.push(address);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_papers_by_id",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
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
                    if (obj.type == "papersList") {
                        $("#loader_paper").hide();
                        self.parsepapersInfo(obj);
                    }else if(obj.type == "papers") {
						self.parsePapers(obj);
                    }else if(obj.type == "papers_price"){
                        self.parsePapers(obj);
                    }
                    else {
                        console.log("no need attation");
                    }
                }else{
					console.log("Get Data From Constract Faield");
				}
            }
        });
    },

	parsePapers: function(papers_info) {
		var self = this;
        // 设置内容
        if (papers_info.papers != "") {
            $("#model_loading").modal("hide");

            if(papers_info.papers.image == undefined || papers_info.papers.image == "img/blank.png") {
                $("#model_no_pic").show();
                var modal = document.querySelector( '#modal-2');
                var overlay = document.querySelector( '.md-overlay' );
                classie.add( modal, 'md-show' );
                $("#papers_id_nopic").text(papers_info.papers.from);
                $("#papers_name_nopic").text(papers_info.papers.name);
                $("#papers_sex_nopic").text(papers_info.papers.sex);
                $("#papers_type_nopic").text(papers_info.papers.type);
                $("#papers_title_nopic").text(papers_info.papers.title);
                $("#papers_detail_nopic").text(papers_info.papers.detail_content);
                $("#papers_time_nopic").text(papers_info.papers.time);
                $("#papers_warning").hide();
            } else {
                // 显示内容
                $("#model_part").show();
                var modal = document.querySelector( '#modal-1');
                var overlay = document.querySelector( '.md-overlay' );
                classie.add( modal, 'md-show' );
                // overlay.removeEventListener( 'click', classie.remove( modal, 'md-show' ) );
                // overlay.addEventListener( 'click', classie.remove( modal, 'md-show' ) );
                $("#papers_id").text(papers_info.papers.from);
                $("#papers_name").text(papers_info.papers.name);
                $("#papers_sex").text(papers_info.papers.sex);
                $("#papers_type").text(papers_info.papers.type);
                $("#papers_title").text(papers_info.papers.title);
                $("#papers_detail").text(papers_info.papers.detail_content);
                $("#papers_image").attr("src",papers_info.papers.image);
                $("#papers_time").text(papers_info.papers.time);
                $("#papers_warning").hide();
            }
            
        } else {
            // 显示没有查询到结果
            $(".box2").hide();
        }
    },
	
    parsepapersInfo: function(papers_info) {
        $("#section_papers").show();
        if (papers_info.data.length == 0) {
            // 显示没有评论
            $("#papers_list").hide();
            $("#papers_warning").show();
            
        } else {
            $("#papers_warning").hide();
            $("#papers_list").empty();
            $("#papers_list").show();
            // 显示内容
            var papers_list = template(document.getElementById('papers_list_t').innerHTML);
            var papers_list_html = papers_list({list: papers_info.data});
            $("#papers_list").append(papers_list_html);
        }
    },
}

var papersEvalutionObj;

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
    papersEvalutionObj = new PapersShow();
    papersEvalutionObj.listenWindowMessage();
    papersEvalutionObj.init();
    
}

var key_pay = "";
var intervalPay = 0;
var serialNumPay = "";
//显示详情信息
function showPapersDetail(key, is_need_price, price_num, pay_to){
     // 查询用户信息
    if (is_need_price == false) {
        $("#model_loading").modal("show");
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_papers_by_key",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    } else {
        $("#model_loading").modal("show");
        key_pay = key;
        // 发送打赏流程
        payForShow(price_num, pay_to);
    }
    
}

function funcIntervalPay() {
    nebPay.queryPayInfo(serialNumPay)   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            var respObject = JSON.parse(resp);
            if (respObject.data.status == 1) {
                // 查询
                var req_args = [];
                req_args.push(key_pay);
                req_args.push(respObject.data);
                window.postMessage({
                    "target": "contentscript",
                    "data":{
                        "to" : dappAddress,
                        "value" : "0",
                        "contract" : {
                            "function" : "query_papers_by_key_with_price",
                            "args" : JSON.stringify(req_args)
                        }
                    },
                    "method": "neb_call"
                }, "*");
            }
            if (respObject.data.status == 1 || respObject.data.status == 0) {

                window.clearInterval(intervalPay);
            }
            
        })
        .catch(function (err) {
            console.log(err);
        });
}

function payForShow(price_num, pay_to) {
    serialNumPay = nebPay.pay(pay_to, price_num, {
        qrcode: {
            showQRCode: false
        },
        goods: {
            name: "payforsee",
            desc: "pay for you to see"
        },
        //callback: cbSendTx
        listener: null
    });

    intervalPay = setInterval(function () {
        funcIntervalPay();
    }, 10000);
}

//隐藏详情信息
function closeDetail(){
	var modal = document.querySelector( '#modal-1');
	classie.remove( modal, 'md-show' );
}

function closeDetail_2() {
    var modal = document.querySelector( '#modal-2');
	classie.remove( modal, 'md-show' );
}

function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#section_papers_info").hide();
        $("#section_papers_papers").hide();
        $("#loader_paper").hide();
        $("#model_no_pic").modal("hide");
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    