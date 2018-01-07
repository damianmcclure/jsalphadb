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
Description: Write Entries To The Database (make sure the db is created)
Example: <br>
```js
db.write("users", "id=1 username=blahblahblah password=md5stuff level=0");
```
<br>
Return Type: Boolean&lt;true/false&gt;


### db.rewrite()
Description: Rewrite Entries To The Database (make sure the db is created)
Example: <br>
```js
db.rewrite("users", "id=1 username=blahblahblah password=md5stuff level=1");
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.writearr()
Description: Write Multiple Entries At Once With An Array
Example: <br>
```js
var is_array_reversed = false;
var multi = ["id=1 username=John password=md5stuff level=0", "id=2 username=Jakob password=md5stuff level=0"];
db.writearr("users", multi, is_array_reversed);
```
<br>
Return Type: Boolean&lt;true/false&gt;

### db.read()
Description: Read Entries In The Database
Example: <br>
```js
// Read All Entries
var users = db.read("users", "", "id username password level");

// Read Entries With Search
var user1 = db.read("users", "id=1", "id username password level");
```
<br>
Return Type: Array&lt;string&gt;
