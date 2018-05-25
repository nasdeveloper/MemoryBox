"use strict";

var PapersItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;//名称
        this.sex = obj.sex;//性别
        this.papersType = obj.papersType;//证件类型
        this.papersNo = obj.papersNo;//证件号码
		this.image = obj.image;//证件号码
		this.time = obj.time;//记录时间
        this.from = obj.from;
	} else {
	    this.name = "";
        this.sex = "";
        this.papersType = "";
        this.papersNo="";
		this.image="";
		this.time ="";
		this.from = "";
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
        var result = this.query_papers_by_key(obj.from+"_"+obj.papersType);
        if(result.success){
            addResult.success = false;
            addResult.message = "You have added a papers!";
            return addResult;
        }else{
            obj.name = obj.name.trim();
            obj.sex = obj.sex.trim();
			obj.papersType = obj.papersType.trim();
			obj.papersNo = obj.papersNo.trim();
			obj.image = obj.image.trim();
			obj.time = obj.time.trim();
            if(obj.name===""|| obj.sex===""||obj.papersType==="" || obj.papersNo === "" || obj.image == ""){
                addResult.success = false;
                addResult.message = "empty name / sex / papersType / papersNo / image";
                return addResult;
            }
            if (obj.name.length > 64 || obj.sex.length > 64 || obj.papersType.length > 64){
                addResult.success = false;
                addResult.message = "name / sex / papersType exceed limit length";
                return addResult;
            }
            var papers = new PapersItem();
            papers.name = obj.name;
            papers.sex = obj.sex;
            papers.papersType = obj.papersType;
            papers.papersNo = obj.papersNo;
            papers.image = obj.image;
            papers.time = obj.time;
            papers.from = obj.from;
            var index = this.papers_list_size;
            this.papers_list_array.put(index,papers.from+"_"+papers.papersType);
            this.papers_list.put(papers.from+"_"+papers.papersType, papers);
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
        var number = this.papers_list_size;
        var papers;
        var key;
        for(var i=0;i<number;i++){
            key = this.papers_list_array.get(i);
            papers = this.papers_list.get(key);
            if(papers&&from==papers.from){
                var temp = {
                    name: papers.name,
                    sex: papers.sex,
                    papersType: papers.papersType,
                    papersNo: papers.papersNo,
                    time: papers.time,
                    from: papers.from
                };
                result.data.push(temp);
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
        if(papers){
            result.success = true;
            result.papers = papers;
        }else{
            result.success = false;
            result.papers = "";
        }
        return result;
    }
   
};

// window.PapersSys = PapersSys;
module.exports = PapersSys;