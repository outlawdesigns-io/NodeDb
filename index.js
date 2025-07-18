"use strict";

var mysql = require('mysql2');

var con = null;

class Db{
  constructor(host,user,password,database){
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;
    if(!con){
      con = mysql.createPool({host:this.host,user:this.user,password:this.password,timezone:process.env.TZ}).promise();
    }
    this.query = '';
    this.params = [];
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
    if(!tableObj['name'] || !tableObj['columns'] || !tableObj['primaryKey']){
      throw new Error('Malformed input object');
    }
    this.query = "CREATE TABLE " + tableObj.name + "(\n";
    for(let i in tableObj.columns){
      let columnName = Object.keys(tableObj.columns[i])[0];
      this.query += columnName + " ";
      this.query += tableObj.columns[i][columnName].join(" ") + ",\n";
    }
    this.query += "PRIMARY KEY (" + tableObj.primaryKey + ")\n";
    this.query += ");";
    return this;
  }
  addColumn(column,dataType){
    this.query = `ALTER TABLE ${this.useTable} ADD ${column} ${dataType}`;
    return this;
  }
  dropColumn(column){
    this.query = `ALTER TABLE ${this.useTable} DROP COLUMN ${column};`;
    return this;
  }
  modifyColumn(column,dataType){
    this.query = `ALTER TABLE ${this.useTable} MODIFY COLUMN ${column} ${dataType};`;
    return this;
  }
  drop(name, table = true){
    this.query = `DROP ${ table ? 'TABLE':'DATABASE'} ${name}`;
    return this;
  }
  table(table){
    this.useTable = `${this.database}.${table}`;
    return this;
  }
  select(selectStr){
    this.query = `SELECT ${selectStr} FROM ${this.useTable}`;
    return this;
  }
  where(clause, params = []){
    this.query += ` WHERE ${clause}`;
    this.params.push(...params);
    return this;
  }
  andWhere(clause,params = []){
    this.query += ` AND ${clause}`;
    this.params.push(...params);
    return this;
  }
  orWhere(clause,params = []){
    this.query += ` OR ${clause}`;
    this.params.push(...params);
    return this;
  }
  truncate(){
    this.query  = `TRUNCATE TABLE ${this.useTable}`;
    return this;
  }
  delete(){
    this.query = `DELETE FROM ${this.useTable}\n`;
    return this;
  }
  update(updateObj){
    this.params = [];
    const keys = Object.keys(updateObj);
    const assignments = keys.map( k => `\`${k}\` = ?`).join(', ');
    this.query = `UPDATE ${this.useTable} SET ${assignments}`;
    this.params.push(...keys.map(k => updateObj[k]));
    return this;
  }
  insert(insertObj){
    this.params = [];
    this.query = `INSERT INTO ${this.useTable} (`;
    const keys = Object.keys(insertObj);
    const placeHolders = keys.map(() => '?');
    this.query += keys.map( k => `\`${k}\``).join(', ') + ') VALUES (' + placeHolders.join(', ') + ')';
    this.params.push(...keys.map(k => insertObj[k]));
    return this;
  }
  orderBy(orderBy){
    this.query += ` ORDER BY ${orderBy}`;
    return this;
  }
  groupBy(condition){
    this.query += ` GROUP BY ${condition}`;
    return this;
  }
  having(where,conditional,condition){
    this.query += ` HAVING ${where} ${conditional} ${condition}`;
    return this;
  }
  leftJoin(table,condition1,conditional,condition2){
    this.query += ` LEFT JOIN ${table} ON ${condition1} ${conditional} ${condition2}`;
    return this;
  }
  rightJoin(table,condition1,conditional,condition2){
    this.query += ` RIGHT JOIN ${table} ON ${condition1} ${conditional} ${condition2}`;
    return this;
  }
  innerJoin(table,condition1,conditional,condition2){
    this.query += ` INNER JOIN ${table} ON ${condition1} ${conditional} ${condition2}`;
    return this;
  }
  crossJoin(table,condition1,conditional,condition2){
    this.query += ` CROSS JOIN ${table} ON ${condition1} ${conditional} ${condition2}`;
    return this;
  }
  async execute(){
    const query = this.query;
    const params = this.params || [];
    this.query = '';
    this.params = [];
    try{
      const result = await con.query(query, params);
      const rows = result[0];
      return rows;
    }catch(err){
      throw err;
    }
  }
  async close(){
    await con.end();
  }
  date(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  async uuid(){
    try{
      const [rows] = await con.query('select uuid() as uuid');
      return rows[0];
    }catch(err){
      throw err;
    }
  }
}
module.exports = Db;
