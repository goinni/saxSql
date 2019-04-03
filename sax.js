/*
 * @Author: houzhenyu 
 * @Date: 2019-04-03 10:28:12
 * @Last Modified by: jerry
 * @Last Modified time: 2019-04-03 10:28:12
 */
module.exports = {
	/**
	 * sql 字符串解析器
	 * [注]执行 delete、inster、update 语句时注意要保证必要条件存在
	 * @条件变量单元 {name=[name]}
	 * @like语法 {name like [%name%]}   
	 * @in语法 {order_list in ([orderList#])}   
	 * @param {*} sqlText 带变量的 sql 字符串
	 * 例：SELECT * FROM table WHERE {name = [name]} and {order_list in ([orderList#])}; 
	 * @param {*} entity 参数对象，
	 * 	即 sql文本中变量的值 
	 *  [注] 参数名必需与sql变量 [xxx]小括号中的 xxx 值一至 
	 * 例：{
	 * 		name: "jerry",
	 * 		orderList: ["1001","1002","1003"] //in 对应的值
	 * }
	 * @sql例子
	 * SELECT  *
		FROM mt_patient_test
		WHERE {record_id = [record_id] }
				and {patient_list in ([patientList#])}
				and {patient_name like [%patientName%]}
				AND {TO_DAYS(record_time_format) = TO_DAYS([record_time_format])} limit 50;
	 */
	sax(sqlText, entity){
		// 获取 sql 字符串中所有变量集合
		// 如： ["{name = [name]}"]
		let variables = sqlText.match(/\{.*?\}/g) || [];
		// 存放参数值数组
		let paramList = [];
		// 缺省对象为空对象
		entity = entity || {};
		// 处理变量集合
		variables.forEach(function (item) {
			// console.log(item);  如：{name = [name]}
			let hasParam = true;
			// 存放当前查询语句中所有条件值（即 ？问号对应的值）
			// 如：db.execSql("select * from user where name=? ", ['houzhenyu'])
			let sqlValues=[];
			// 获取变量中的值
			// 如：[ '[name]' ]
			let itemUnit = item.match(/\[.*?\]/g);
			//替换条件单元{}
			let serItem = item.replace(/(^\{\s*)|(\s*\}$)/g, "");
			// 处理一个条件参数部分
			itemUnit.forEach(function (temp) {
				// 替换特殊语法符号
				let param = temp.replace(/(^\[\s*%*)|(#*%*\s*\]$)/g, "");
				// 从条件参数对象中获取该条件值
				// 如果有值，构造条件部分语句
				if (entity[param]) {
					// 判断是否为 list 值 语句，如：in 语法
					if(/#/.test(temp)){
						serItem = serItem.replace(temp, entity[param].join(','));
					}else{
						//替换查询条件对应的变量值为？
						// 如: select * from user where name = ?
						serItem = serItem.replace(temp, '?'); 
						// 获取对应条件值
						let tp = entity[param];
						// 判断是否为 左 like 语句
						if(/^\[\s*%/.test(temp)){
							tp = '%'+tp;
						}
						// 判断是否为 右 like 语句
						if(/%\s*\]$/.test(temp)){
							tp = tp +'%';
						}
						// 将对应 ？号 条件值存入条件数组中
						sqlValues.push(tp);
					}
					
				} else {
					// 无条件语句
					hasParam = false;
				}
			});
			// 有条件参数部分
			if(hasParam){
				sqlText = sqlText.replace(item, serItem);
				paramList = paramList.concat(sqlValues);
			}else{
				// 无条件参数部分
				// 无条件将变量单元替换 1=1 
				// 如：select * from user where {name=[name]} 
				// 替换结果为 select * from user where 1=1
				sqlText = sqlText.replace(item, ' 1=1 ');
			}
		});
		// 将结构化后的 sql 字符串、参数 统一返回
		return {
			// 如：select * from user where name = ? and age = ? 
			sql: sqlText,
			// 如： ["jerry", 29]
			params: paramList
		}
	}
	
}