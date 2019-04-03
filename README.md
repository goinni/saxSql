# saxSql
## 解析带特定语法条件的sql 字符串，方便处理带条件的 sql,省去拼接字符串问题
[注]执行 delete、inster、update 语句时注意要保证必要条件存在,防止无条件批量处理
## 语法规则
普通条件变量单元
```
{name=[name]}
```
like语法(支持左或右单个%号)
```
{name like [%name%]}   
```
in语法(变量后必需加#号)
```
{order_list in ([orderList#])} 
```
## 使用方法
```
/**
 * @param {*} sqlText 带变量的 sql 字符串
 * @param {*} entity 参数对象
 * @return {sql,params}
 */
sax(sqlText, entity)
```
## 返回值
```
// 例如
{
	sql: "select * from user where name = ? and age = ?",
	params: "["houzhenyu", 29]"
}
```
## 例子
```
// sql 字符串
var sqlText = "SELECT  * \
	FROM mt_patient_test \
	WHERE {record_id = [record_id] } \
			and {patient_list in ([patientList#])} \
			and {patient_name like [%patientName%]} \
			AND {TO_DAYS(record_time) = TO_DAYS([record_time])} limit 50";
// 条件参数
var entity = {
	record_id: "H00001",
	patientList: ["1001","1002","1003"],
	record_time: "2019-04-13 10:53"
};
// 执行生成标准 sal 字符串和对应的参数
sax(sqlText, entity);
```
