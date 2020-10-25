# Db

Db (database) is a utility class that is intended to facilitate communications with a MySQL server.

You can chain together Db's methods to build and execute queries for you, eliminating long query strings in your code.

## Requirements

* [mysql](https://www.npmjs.com/package/mysql)

## Methods


### table(table:string)

Set the table you wish to query.

### select(selectStr:string)

Set the columns you wish to select.

### where(whereStr:string)

Add a WHERE clause to your query.

```
(async ()=>{
  const conn = new Database('localhost','user','pass','mysql');
  let users = await conn.table('user').select('user').where("password_expired = 'Y'").execute().catch(console.error);
  console.log(users);
})();
```

### andWhere(whereStr:string)

Add an AND clause to your query. This can be repeated as many times as desired.


### orWhere(whereStr:string)

Add an OR clause to your query. This can be repeated as many times as desired.


### orderBy(whereStr:string)

Add an ORDER BY clause to your query.


### insert(data:obj)

Insert a new record into the selected database and table.

```
(async ()=>{
  const conn = new Database('localhost','user','pass','target_db');
  let obj = {key:'value',key2:'value2',key3:4};
  await conn.table('target_table').inset(obj).execute().catch(console.error);
  console.log(users);
})();

```

### update(data:obj)

Update a specific record from the selected database and table. Note, if not combined with a where clause, this method will update all records in your table.

```
(async ()=>{
  const conn = new Database('localhost','user','pass','target_db');
  let obj = {id:3,key:'value',key2:'value2',key3:4};
  await conn.table('target_table').update(obj).where("id = " + obj.id)execute().catch(console.error);
})();
```

### execute()

Execute the query that you have constructed.


## Usage

* [NodeRecord](https://github.com/outlawdesigns-io/NodeRecord)
