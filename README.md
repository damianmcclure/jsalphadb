# jsalphadb
Simple flat-file database system for NodeJS &amp; Port of phpAlphaDB
Version: 1.0.3

## Installation
I recommend you install from NPM<br>
`npm install jsalphadb`<br>
<br>
Put this at the top of your javascript file.

```js
var key = "Something"; // The secret key, though theres no point to changing it.
var ext = ".4db"; // The extension of the database.

const jsAlphaDB = require("jsalphadb");
const db = new jsAlphaDB(key, ext);
```
Make sure node is allowed to write to the filesystem.

## Description
This is a Node.js remake of the flatfile database system made by HeapOverride called phpAlphaDB.
The purpose is to create a basic, easy to learn and use flat database system for JavaScript

This was made when I was in my JavaScript infancy, so I did a lot of things wrong and wrote a lot of messy code.
Since I saw there were still weekly downloads, I decided I should maintain it again and give it a little clean-up.

## Docs
There is the legacy fully synchronous version still in the program, and it's exactly the same syntax as before. However, I will always recommend you use promises as they are non-blocking.

```js
const Alpha = require("jsalphadb");

// make a new database instance
const db = new Alpha("test");
const table = "my table";

// create a table
db.create(table); // will be "my_table" on the filesystem, returns true or false if it was successful in creating it.

// add some data
db.write(table, `id=${Date.now()} name=${db.en("John Smith")} role=admin`); // each of these returns true or false if it was successful in writing it.
db.write(name, `id=${Date.now()} name=${db.en("James Kenny")} role=user`); // since we have spaces in the name, we need to encode it for it to be stored properly.
db.write(name, `id=${Date.now()} name=${db.en("Jim Johnson")} role=user`);

// get some data
const rows = db.read(name, "role=admin", "name role"); // will return James Kenny and Jim Johnson rows, with name and role. excluses the id row cuz we didn't select it.
for(const row of rows){
    // extract the data from the rows
    const name = db.de(db.column(row, "name")); // since we have encoded the name, we need to decode it now.
    const role = db.column(row, "role"); // role is plaintext
}

// delete some data
db.rowdelete(name, `name=${db.en("Jim Johnson")}`); // will remove the Jim Johnson row in our table.

// all of the same stuff but with promises
(async () => {
    const db = new Alpha.promises("test");
    const table = "my async table";

    await db.create(table);

    await db.write(table, `id=${Date.now()} name=${db.en("John Smith")} role=admin`);
    await db.write(name, `id=${Date.now()} name=${db.en("James Kenny")} role=user`);
    await db.write(name, `id=${Date.now()} name=${db.en("Jim Johnson")} role=user`);

    const rows = await db.read(name, "role=admin", "name role");
    for await(const row of rows){
        const name = await db.de(db.column(row, "name"));
        const role = await db.column(row, "role");
    }

    // delete some data
    await db.rowdelete(name, `name=${db.en("Jim Johnson")}`);
})();
```

## License
WTFPL - http://www.wtfpl.net/
