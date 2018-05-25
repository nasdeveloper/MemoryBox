"use strict";

var PapersItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;//名称
        this.sex = obj.sex;//性别
        this.title = obj.title; // 标题
        this.remarks = obj.remarks; // 备注
        this.type = obj.type;   // 类型
        this.detail_content = obj.detail_content;   // 详细内容
        this.image = obj.image; // 图片
        this.time = obj.time;   // 存储时间
        this.from = obj.from;
        this.key = obj.key;     // from + 时间戳
        this.is_need_price = obj.is_need_price; // 是否收费
        this.price_num = obj.price_num; // 价格
	} else {
	    this.name = "";//名称
        this.sex = "";//性别
        this.title = ""; // 标题
        this.remarks = ""; // 备注
        this.type = "";   // 类型
        this.detail_content = "";   // 详细内容
        this.image = ""; // 图片
        this.time = "";   // 存储时间
        this.from = "";
        this.key = "";     // from + 时间戳
        this.is_need_price = false;
        this.price_num = 0;
	}
};


PapersItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var PapersSys = function() {
    // 1. 先创建GoldSunStorage对象（用于存储数据）
    // 2. 定义数据结构，该行代码作用：为ApiSample创建一个属性sample_data，该属性是一个list结构，list中存储的是SampleDataItem对象
    LocalContractStorage.defineMapProperty(this, "papers_list", {
        parse: function (text) {
            return new PapersItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "papers_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "papers_list_array");

    // 3. 经过1和2步，数据结构定义完成，下面需要实现接口方法，所有的数据都存放在sample_data中
}
PapersSys.prototype = {
    // 初始化方法，在使用ApiSample之前，务必要调用一次(而且只能调用一次)，所有的初始化逻辑都放到这里
    init: function() {
        if (this.papers_list_size == null) {
            this.papers_list_size = 0;
        }
        if (this.papers_list_size == null) {
            this.papers_list_size = 0;
        }
    },
    // 添加一个对象到list中的例子
    add_papers_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        obj.from = Blockchain.transaction.from;
        var result = this.query_papers_by_key(obj.from+"_"+obj.timestamp);
        if(result.success){
            addResult.success = false;
            addResult.message = "Add Error";
            return addResult;
        }else{
            obj.name = obj.name.trim();
            obj.sex = obj.sex.trim();
			obj.title = obj.title.trim();
			obj.remarks = obj.remarks.trim();
			obj.type = obj.type.trim();
			obj.detail_content = obj.detail_content.trim();
            if(obj.name===""|| obj.sex===""||obj.title==="" || obj.remarks === "" || obj.detail_content == ""){
                addResult.success = false;
                addResult.message = "info is not complated";
                return addResult;
            }
            var papers = new PapersItem();
            papers.name = obj.name;
            papers.sex = obj.sex;
            papers.title = obj.title;
            papers.remarks = obj.remarks;
            papers.type = obj.type;
            papers.detail_content = obj.detail_content;
            papers.image = obj.image;
            papers.time = obj.time;
            papers.key = obj.from+"_"+obj.timestamp;
            papers.from = obj.from;
            papers.is_need_price = obj.is_need_price;
            papers.price_num = new BigNumber(obj.price_num);
            var index = this.papers_list_size;
            this.papers_list_array.put(index,obj.from+"_"+obj.timestamp);
            this.papers_list.put(obj.from+"_"+obj.timestamp, papers);
            this.papers_list_size +=1;
            addResult.success = true;
            addResult.message = "You successfully added a papers!";
            return addResult;
        }
    },
	
    papers_list_size : function(){
        return this.papers_list_size;
    },
   
    query_my_papers: function(){
        var from = Blockchain.transaction.from;
        return this.query_papers_by_id(from);
    },
	// 根据id查找列表
	query_papers_by_id : function(from){
        var result = {
            success : false,
            type:"papersList",
            data : []
        };
        if(from===""){
            result.success = false;
            return result;
        }
        var number = this.papers_list_size;
        var papers;
        var key;
        for(var i=0;i<number;i++){
            key = this.papers_list_array.get(i);
            papers = this.papers_list.get(key);
            if(papers&&from==papers.from){
                var is_own = false;
                if (Blockchain.transaction.from == papers.from) {
                    is_own = true;
                }
                var temp = {
                    name: papers.name,
                    sex: papers.sex,
                    title: papers.title,
                    remarks: papers.remarks,
                    type: papers.type,
                    time: papers.time,
                    from: papers.from,
                    key: papers.key,
                    is_need_price: papers.is_need_price,
                    price_num: papers.price_num,
                    is_own: is_own
                };
                if (is_own == true || papers.is_need_price == true) {
                    result.data.push(temp);
                }
                
            }
        }
        if(result.data === ""){
            result.success = false;
        }else if(result.data.length>0){
            result.success = true;
        }else{
			result.success = false;
		}
        return result;
    },
	
	//获取对象
	query_papers_by_key: function(key) {
        var result = {
            success : false,
			type:"papers",
            papers : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.papers = "";
            return result;
        }
        var papers = this.papers_list.get(key);
        if(papers && (papers.is_need_price == false || papers.from == Blockchain.transaction.from)){
            result.success = true;
            result.papers = papers;
        }else{
            result.success = false;
            result.papers = "";
        }
        return result;
    },

    query_papers_by_key_with_price: function(key, ret_data) {
        var result = {
            success : false,
			type:"papers_price",
            papers : ""
        };
        // var hash = ret_data.hash;
        // var from = ret_data.from;
        // var to = ret_data.to;
        // var value = new BigNumber(ret_data.value);
        
        if (key == "") {
            result.success = false;
            return result;
        }
        var papers = this.papers_list.get(key);

        if (papers) {
            // if (hash == "" || from != Blockchain.transaction.from || to != papers.from) {
            //     result.success = false;
            //     return result;
            // }
    
            // if (value < papers.price_num) {
            //     result.success = false;
            //     return result;
            // }
            result.success = true;
            result.papers = papers;
            return result;
        }
        result.success = true;
        return result;
    },
   
};

// window.PapersSys = PapersSys;
module.exports = PapersSys;