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
      if(i++ < max){
        this.query += value + '=' + (isNaN(updateObj[value]) ? "\'" + updateObj[value].replace(/'/g,"''") + "\'":updateObj[value]) + ',';
        //this.query += value + '=' + "\'" + updateObj[value].replace(/'/g,"''") + "\',";
      }else{
        this.query += value + '=' + (isNaN(updateObj[value]) ? "\'" + updateObj[value].replace(/'/g,"''") + "\'":updateObj[value]);
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
  date(dateStr){
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    if(dateStr === undefined){
      return (new Date(Date.now() - tzoffset)).toISOString().substring(0, 19).replace('T', ' ');
    }
    return (new Date(Date.parse(dateStr) - tzoffset)).toISOString().substring(0, 19).replace('T', ' ');
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
