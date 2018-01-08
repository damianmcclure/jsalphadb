## FUNCTIONS AND RETURN TYPES

### db.create()
Description: Create A Database<br>
Example: <br>
```js
db.create("users");
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.delete()
Description: Delete A Database<br>
Example: <br>
```js
db.delete("users");
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.list()
Description: List of Databases<br>
Example: <br>
```js
db.list();
```
<br>
Return Type: String

### db.write()
Description: Write Entries To The Database (make sure the db is created)<br>
Example: <br>
```js
db.write("users", "id=1 username=blahblahblah password=md5stuff level=0");
```
<br>
Return Type: Boolean&lt;true/false&gt;


### db.rewrite()
Description: Rewrite Entries To The Database (make sure the db is created)<br>
Example: <br>
```js
db.rewrite("users", "id=1 username=blahblahblah password=md5stuff level=1");
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.writearr()
Description: Write Multiple Entries At Once With An Array<br>
Example: <br>
```js
var is_array_reversed = false;
var multi = ["id=1 username=John password=md5stuff level=0", "id=2 username=Jakob password=md5stuff level=0"];
db.writearr("users", multi, is_array_reversed);
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.read()
Description: Read Entries In The Database<br>
Example: <br>
```js
// Read All Entries
var users = db.read("users", "", "id username password level");

// Read Entries With Search
var user1 = db.read("users", "id=1", "id username password level");
```
<br>
Return Type: Array&lt;string&gt;

### db.column_names()
Description: Returns column names of a specific row<br>
Example: <br>
```js
var column_names = db.column_names("users", 1);
```
<br>
Return Type: Array&lt;string&gt;

### db.column_values()
Description: Returns column values of a specific row<br>
Example: <br>
```js
var column_values = db.column_values("users", 1);
```
<br>
Return Type: Array&lt;string&gt;

### db.rows()
Description: Returns the amount of rows that aren't empty.<br>
Example: <br>
```js
db.rows("users")
```
<br>
Return Type: Array&lt;string&gt;

### db.rowdelete()
Description: Delete 1 single row<br>
Example: <br>
```js
var contains = false; // Set to true if you want it to be contains instead of exact.
var inverted = false; // CAUTION: Do not enable this unless you want to delete all rows besides the matching ones

db.rowdelete("users", "id=1", contains, inverted);
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.column()
Description: Get The Result from return array from `db.read()` (remember machines start with 0, not 1)<br>
Example: <br>
```js
db.column(stuff, 0);
```
<br>
Return Type: String

### db.en()
Description: Encodes String So You Can put string with spaces or equal signs into the database.<br>
Example: <br>
```js
db.en("string");
```
<br>
Return Type: String

### db.de()
Description: Decodes string so you can use the string you put into the database<br>
Example: <br>
```js
db.de("encoded:string");
```
<br>
Return Type: String

### db.de()
Description: This function prints safe version of html stuff. Completly useless unless your using a webserver or other html.
Example: <br>
```js
db.printsafe("<html>string</html>");
```
<br>
Return Type: String

## IMPORTANT EXAMPLES
Main Example 1:<br>
```js
var stuffs = db.read("test_db", "", "id name level");
for(var stuff of stuffs){
    var id = db.column(stuff, 0);
    var name = db.de(db.column(stuff, 1));
    var level = db.column(stuff, 2);

    console.log("ID is: "+id+"\nName is: "+name+"\nLevel is: "+level+"\n\n");
}
```
<br>
What This Does: This is the basic building block of this database system. It checks each row in test_db, returns the array of lines, then a foreach statement goes thru each line. db.column() interprets the line and gets the value needed. db.de() decodes any values you may have encoded to keep spaces. and then it console.logs it.
