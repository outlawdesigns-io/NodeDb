"use strict";

var mysql = require('mysql');

var con = null;

class Db{
  constructor(host,user,password,database){
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;
    if(!con){
      con = mysql.createPool({host:this.host,user:this.user,password:this.password,timezone:process.env.TZ});
    }
    this.query = '';
  }
  createInstance(host,user,password,database){
    let object = new Db(host,user,password,database);
    return object;
  }
  getInstance(host,user,password,database){
    if(!this.instance){
      this.instance = this.createInstance();
    }
    return this.instance;
  }
  createDatabase(dbName){
    this.query = 'CREATE DATABASE ' + dbName;
    return this;
  }
  createTable(tableObj){
    if(!table['name'] || !table['columns'] || !table['primaryKey']){
      throw new Error('Malformed input object');
    }
    this.query = "CREATE TABLE " + table.name + "(\n";
    for(let i in table.columns){
      let columnName = Object.keys(table.columns[i])[0];
      this.query += columnName + " ";
      for(let j in table.columns[i][columnName]){
        if(j == (table.columns[i][columnName].length - 1)){
          this.query += table.columns[i][columnName][j] + ",\n";
        }else{
          this.query += table.columns[i][columnName][j] + " ";
        }
      }
    }
    this.query += "PRIMARY KEY (" + table.primaryKey + ")\n";
    this.query += ");";
    return this;
  }
  addColumn(column,dataType){
    this.query = 'ALTER TABLE ' + this.useTable + ' ADD ' + column + ' ' + dataType + ';';
    return this;
  }
  dropColumn(column){
    this.query = 'ALTER TABLE ' + this.useTable + ' DROP COLUMN ' + column + ';';
    return this;
  }
  modifyColumn(column,dataType){
    this.query = 'ALTER TABLE ' + this.useTable + ' MODIFY COLUMN ' + column + ' ' + dataType + ';';
  }
  drop(name, table = true){
    if(table){
      this.query = 'DROP TABLE ' + name;
    }else{
      this.query = 'DROP DATABASE ' + name;
    }
    return this;
  }
  table(table){
    this.useTable = this.database + '.' + table;
    return this;
  }
  select(selectStr){
    this.query = 'SELECT ' + selectStr + ' FROM ' + this.useTable;
    return this;
  }
  where(whereStr){
    this.query += ' WHERE ' + whereStr;
    return this;
  }
  andWhere(whereStr){
    this.query += ' AND ' + whereStr;
    return this;
  }
  orWhere(whereStr){
    this.query += ' OR ' + whereStr;
    return this;
  }
  truncate(){
    this.query += "TRUNCATE TABLE " + this.useTable;
    return this;
  }
  delete(){
    this.query += "DELETE FROM " + this.useTable + "\n";
    return this;
  }
  update(updateObj){
    this.query = 'UPDATE ' + this.useTable + ' SET ';
    var value;
    var i = 0;
    var max = Object.keys(updateObj).length - 1;
    for(value in updateObj){
      let updateValue = updateObj[value];
      if(updateValue instanceof Date){
        updateValue = this.date(updateValue);
      }
      if(i++ < max){
        this.query += "`" + value + "`=" + (isNaN(updateValue) ? "\'" + updateValue.replace(/'/g,"''") + "\'":updateValue) + ',';
        //this.query += value + '=' + "\'" + updateObj[value].replace(/'/g,"''") + "\',";
      }else{
        this.query += "`" + value + "`=" + (isNaN(updateValue) ? "\'" + updateValue.replace(/'/g,"''") + "\'":updateValue);
        // this.query += value + '=' + "\'" + updateObj[value].replace(/'/g,"''") + "\'";
      }
    }
    return this;
  }
  insert(insertObj){
    this.query = 'INSERT INTO ' + this.useTable + '(';
    var keys = Object.keys(insertObj);
    var max = keys.length - 1;
    var i = 0;
    var k;
    for(k in keys){
      if(i++ < max){
        this.query += "`" + keys[k] + '`,';
      }else{
        this.query += "`" + keys[k] + '`)';
      }
    }
    this.query += ' VALUES (';
    i = 0;
    var value;
    for(value in insertObj){
      if(typeof insertObj[value] === 'string' && i < max){
        this.query += "\'" + insertObj[value].replace(/'/g,"''") + "\',";
      }else if(typeof insertObj[value] === 'string'){
        this.query += "\'" + insertObj[value].replace(/'/g,"''") + "\')";
      }else if(i < max){
        this.query += "\'" + insertObj[value] + "\',";
      }else{
        this.query += "\'" + insertObj[value] + "\')";
      }
      i++;
    }
    return this;
  }
  orderBy(orderBy){
    this.query += ' ORDER BY ' + orderBy;
    return this;
  }
  groupBy(condition){
    this.query += ' GROUP BY ' + condition;
    return this;
  }
  having(where,conditional,condition){
    this.query += ' HAVING ' + where + ' ' + conditional + ' ' + condition;
    return this;
  }
  leftJoin(table,condition1,conditional,condition2){
    this.query += ' LEFT JOIN ' + table + ' ON ' + condition1 + ' ' + conditional + ' ' + condition2;
    return this;
  }
  rightJoin(table,condition1,conditional,condition2){
    this.query += ' RIGHT JOIN ' + table + ' ON ' + condition1 + ' ' + conditional + ' ' + condition2;
    return this;
  }
  innerJoin(table,condition1,conditional,condition2){
    this.query += ' INNER JOIN ' + table + ' ON ' + condition1 + ' ' + conditional + ' ' + condition2;
    return this;
  }
  crossJoin(table,condition1,conditional,condition2){
    this.query += ' CROSS JOIN ' + table + ' ON ' + condition1 + ' ' + conditional + ' ' + condition2;
    return this;
  }
  execute(){
    return new Promise((resolve,reject)=>{
      con.query(this.query,(err,rows)=>{
        if(err){
          return reject(err);
        }else{
          resolve(rows);
        }
      })
    });
  }
  close(){
    return new Promise((resolve,reject)=>{
      con.end(err=>{
        if(err){
          return reject(err);
        }
        resolve();
      });
    });
  }
  date(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  uuid(){
    return new Promise((resolve,reject)=>{
      con.query('select uuid() as uuid',(err,rows)=>{
        if(err) return reject(err);
        resolve(rows[0]);
      });
    });
  }
}
module.exports = Db;
