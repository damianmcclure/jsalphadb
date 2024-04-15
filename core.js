/**
 * This is a Node.js remake of the flatfile database system made by HeapOverride called phpAlphaDB.
 * The purpose is to create a basic, easy to learn and use flat database system for JavaScript
 * 
 * This was made when I was in my JavaScript infancy, so I did a lot of things wrong and wrote a lot of messy code.
 * Since I saw there were still weekly downloads, I decided I should maintain it again and give it a little clean-up.
 * 
 * @author Damian Mcclure
 * @link https://github.com/damianmcclure/jsalphadb
 */

const fs = require("fs");

class AlphaUtils {
    /** @param {string} tableName @returns {string} */
    static formatTableName(tableName){
        tableName = tableName.replace(/\s+/g, "_");
        tableName = tableName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
        tableName = tableName.slice(0, 255);
        return tableName;
    }

    /** @param {string} value @returns {string} */
    static encode(value){
        let ret = "encoded:";
        ret += Buffer.from(value).toString("base64");
        ret = ret.replace(/=/g, "^");
        return ret;
    }

    /** @param {string} value @returns {string} */
    static decode(value){
        if(!value.startsWith("encoded")){
            return value;
        }

        value = value.replace("encoded", "");
        value = value.replace(/\^/g, "=");
        value = Buffer.from(value, "base64").toString("ascii");
        return value;
    }
}

class AlphaPromises {
    #extension = ".4db";
    #entirePath = "";
    #initialized = false;

    /** @param {string} key @param {string} extension */
    constructor(key, extension = ".4db"){
        this.#extension = extension;
        this.#entirePath = `./databases/${key}/`;

        this.#setup();
    }

    async #setup(){
        if(!await this.#fileExists("./databases/")){
            await fs.promises.mkdir("./databases/");
        }

        if(!await this.#fileExists(this.#entirePath)){
            await fs.promises.mkdir(this.#entirePath);
        }

        this.#initialized = true;
    }

    async #fileExists(path){
        try {
            await fs.promises.stat(path);
            return true;
        } catch(err) {
            return false;
        }
    }

    #forInitialization(){
        return new Promise((resolve) => {
            if(this.#initialized){
                resolve(true);
            }
    
            const interval = setInterval(() => {
                if(this.#initialized){
                    resolve(true);
                    clearInterval(interval);
                }
            }, 200);
        })
    }

    #getPath(tableName){
        return `${this.#entirePath}${AlphaUtils.formatTableName(tableName)}${this.#extension}`;
    }

    /**
     * Create a new flat-file table.
     * @param {string} tableName The name for the table. Spaces will be replaced with underscores, and other non-valid file name symbols will be removed.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async create(tableName){
        await this.#forInitialization();
        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            await fs.promises.writeFile(tablePath, "");
            return true;
        }

        return false;
    }

    /**
     * Delete a flat-file table.
     * @param {string} tableName The name for the table. Spaces will be replaced with underscores, and other non-valid file name symbols will be removed.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async delete(tableName){
        await this.#forInitialization();
        const tablePath = this.#getPath(tableName);
        if(await this.#fileExists(tablePath)){
            await fs.promises.unlink(tablePath);
        }

        return false;
    }

    /**
     * List all of the tables within the instance of the database.
     * @param {boolean} asArray If to return an array or not. 
     * @returns {Promise<string|string[]>} Each of the tables.
     */
    async list(asArray = false){
        await this.#forInitialization();
        const files = await fs.promises.readdir(this.#entirePath);
        const tables = [];
        for await(const file of files){
            if(file.endsWith(this.#extension)){
                tables.push(file.replace(this.#extension, ""));
            }
        }

        // The reason I don't return it as an array by default is because this is the way it was done before. I don't wanna break compatibility.
        return asArray ? tables : tables.join("\n");
    }

    /**
     * Write a new row to the table.
     * @param {string} tableName The name of the table to write a row to.
     * @param {string|object} values The values to write to the table. Can support the raw string or an object.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async write(tableName, values){
        await this.#forInitialization();
        if(Array.isArray(values)){
            return await this.writearr(tableName, values);
        }

        if(typeof values === "object"){
            const entries = Object.keys(values).map(key => `${key}=${values[key]}`);
            values = entries.join(" ");
        }

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
           return false;
        }

        values = encodeURI(values);
        const contents = await fs.promises.readFile(tablePath, "utf-8");
        await fs.promises.writeFile(tablePath, contents === ""
            ? values
            : `${values}\n${contents}`
        );

        return true;
    }

    /**
     * Overwrite a row in the table.
     * @param {string} tableName The name of the table to read from.
     * @param {any} values The values to be overwritten.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async rewrite(tableName, values){
        await this.#forInitialization();
        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return false;
        }

        const newRows = [];

        const contents = await fs.promises.readFile(tablePath, "utf-8");
        const entries = values.split(" ");
        const [searchKey, searchValue] = entries[0].split("=");

        const rows = contents.split("\n");
        for await(const row of rows){
            const rowEntries = decodeURI(row).split(" ");
            const [compareKey, compareValue] = rowEntries[0].split("=");

            if(searchKey === compareKey && searchValue === compareValue){
                const object = {};
                for await(const rowEntry of rowEntries){
                    const [key, value] = rowEntry.split("=");
                    object[key] = value;
                }

                for await(const entry of entries){
                    const [key, value] = entry.split("=");
                    object[key] = value;
                }

                const newRow = Object.keys(object).map(key => `${key}=${values[key]}`);
                newRows.push(encodeURI(newRow.join(" ")));
            }
        }

        await fs.promises.writeFile(tablePath, `${newRows.join("\n")}\n${contents}`);
        return true;
    }

    /**
     * Write an array of rows to the table.
     * @param {string} tableName The name of the table to read from.
     * @param {string[]} multiValues The array of values to write.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async writearr(tableName, multiValues){
        await this.#forInitialization();
        if(!Array.isArray(multiValues)){
            return false;
        }

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return false;
        }

        let stringify = [];
        for(let value of multiValues){
            if(typeof value === "object"){
                const entries = Object.keys(value).map(key => `${key}=${value[key]}`);
                value = entries.join(" ");
            }

            stringify.push(encodeURI(value));
        }

        const values = stringify.join("\n");
        const contents = await fs.promises.readFile(tablePath, "utf-8");
        await fs.promises.writeFile(tablePath, contents === ""
            ? values
            : `${values}\n${contents}`
        );

        return true;
    }

    /** 
     * Delete a row by search.
     * @param {string} tableName The name of the table to read from.
     * @param {boolean} search The search values.
     * @returns {Promise<boolean>} If the operation was successful or not.
     */
    async rowdelete(tableName, values, search = false, inverted_search = false){
        await this.#forInitialization();
        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return false;
        }

        let success = false;
        let contents = await fs.promises.readFile(tablePath, 'utf8');
        let pairs2 = values.split(" ");
        let first2 = pairs2[0].split("=");
        let rows = contents.split("\n");
        let new_content = "";
        for await(let row of rows){
            if(rows.length !== 0){
                let rowpairs = decodeURI(row).split(" ");
                let found = false;
                for await(let rowpair of rowpairs){
                    let first1 = rowpair.split("=");
                    if(inverted_search === true){
                        if(search === true){
                            if(first1[0] === first2[0] && first1[1].includes(first2[1]) === false){ success = true; found = true; }
                        } else {
                            if(first1[0] === first2[0] && first1[1] !== first2[1]){ success = true; found = true;}
                        }
                    } else {
                        if(search === true){
                            if(first1[0] === first2[0] && first1[1].includes(first2[1]) !== false){ success = true; found = true; }
                        } else {
                            if(first1[0] === first2[0] && first1[1] === first2[1]){ success = true; found = true;}
                        }
                    }
                }
                if(found === false){
                    new_content = new_content+row+"\n";
                }
            }
        }
        
        if(success){
            await fs.promises.writeFile(tablePath, new_content);
        }

        return success;
    }

    /**
     * Read a row from the table.
     * @param {string} tableName The name of the table to read from.
     * @param {string|string[]} search The subject to search for.
     * @param {string|string[]} columnsToReturn The columns to return. Supports both a string that has spaces between column names, and an array of column names.
     * @returns {Promise<array>} The read rows.
     */
    async read(tableName, search, columnsToReturn){
        await this.#forInitialization();
        if(typeof columnsToReturn === "string"){
            columnsToReturn = columnsToReturn.split(" ");
        }

        if(!Array.isArray(columnsToReturn)){
            return [];
        }

        if(typeof search === "string"){
            search = search.split(" ");
        }

        if(!Array.isArray(search)){
            return [];
        }

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return [];
        }

        const contents = await fs.promises.readFile(tablePath, "utf-8");
        const rows = contents.split("\n");
        const results = [];
        for await(const row of rows){
            if(row === ""){
                // this really isn't my favorite functionality, but it is original functionality.
                break;
            }

            const columns = decodeURI(row).split(" ");
            let rowMatches = false;
            for await(const column of columns){
                if(search.length === 0){
                    rowMatches = true;
                    continue;
                }

                const [key, value] = column.split("=");
                for await(const s of search){
                    const [searchKey, searchValue] = s.split("=");
                    if(key === searchKey && value === searchValue){
                        rowMatches = true;
                    }
                }
            }

            if(rowMatches){
                const matches = columnsToReturn.map(toReturn => {
                    for(const column of columns){
                        const [key, value] = column.split("=");
                        if(toReturn === key){
                            return `${key}=${value}`
                        }
                    }
                    return undefined;
                });
                results.push(matches.join(" "));
            }
        }

        return results;
    }


    /**
     * Get the names of all the columns of a specific row index.
     * @param {string} tableName The name of the table to read from.
     * @param {number} rowIndex The index of the row to get names from.
     * @returns {Promise<Array>} The names of the columns.
     */
    async column_names(tableName, rowIndex){
        await this.#forInitialization();
        const names = [];

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return [];
        }

        const contents = await fs.promises.readFile(tablePath, "utf-8");
        const rows = contents.split("\n");
        if(rowIndex < rows.length){
            const row = decodeURI(rows[rowIndex]);
            const [key, value] = row.split(" ");
            names.push(key);
        }

        return names;
    }

    /**
     * Get the values of all the columns of a specific row index.
     * @param {string} tableName The name of the table to read from.
     * @param {number} rowIndex The index of the row to get values from.
     * @returns {Promise<Array>} The values of the columns.
     */
    async column_values(tableName, rowIndex){
        await this.#forInitialization();
        const values = [];

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return [];
        }

        const contents = await fs.promises.readFile(tablePath, "utf-8");
        const rows = contents.split("\n");
        if(rowIndex < rows.length){
            const row = decodeURI(rows[rowIndex]);
            const [key, value] = row.split(" ");
            values.push(value);
        }

        return values;
    }

    /**
     * Get the total amount of rows in a table.
     * @param {string} tableName The name of the table to read from.
     * @returns {Promise<number>}
     */
    async rows(tableName){
        await this.#forInitialization();
        let length = 0;

        const tablePath = this.#getPath(tableName);
        if(!await this.#fileExists(tablePath)){
            return length;
        }

        const contents = await fs.promises.readFile(tablePath, "utf-8");
        const rows = contents.split("\n");
        for await(const row of rows){
            if(row !== ""){
                length++;
            }
        }

        return length;
    }

    /**
     * Get the column value from the row by index or key.
     * @param {string} row The CSV returned row from Alpha.read.
     * @param {number|string} index The index or key to get the value by.
     * @returns {string} The gotten value.
     */
     column(row, index){
        const entries = row.split(" ");
        const columns = [];
        for(const entry of entries){
            columns.push(decodeURI(entry).split("="));
        }

        // get by index number
        if(typeof index === "number"){
            if(index < columns.length){
                return columns[index][1];
            }
        }

        // get by column name
        if(typeof index === "string"){
            for(const [key, value] of columns){
                if(key === index){
                    return value;
                }
            }
        }

        return "";
    }

    /** 
     * Encode so that it doesn't interfere with the Alpha formatting.
     * @param {string} value The string to be encoded.
     * @returns {string} The encoded value.
     */
    en(value){
        return AlphaUtils.encode(value);
    }

    /** 
     * Decode a previously encoded value.
     * @param {string} value The string to be decoded.
     * @returns {string} The original value.
     */
    de(value){
        return AlphaUtils.decode(value);
    }

    /**
     * Print something safe (legacy code, keep original functionality).
     * @param {string} value The thing to be "printed" safe.
     * @returns {string} The cleaned value.
     */
    printsafe(value){
        value.replace(/</g, "&gt;")
             .replace(/>/g, "&lt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&apos;");
        
        return value;
    }
}

class Alpha {
    static promises = AlphaPromises;

    #extension = ".4db";
    #entirePath = "";

    /** @param {string} key @param {string} extension */
    constructor(key, extension = ".4db"){
        this.#extension = extension;
        this.#entirePath = `./databases/${key}/`;

        if(!fs.existsSync("./databases/")){
            fs.mkdirSync("./databases/");
        }

        if(!fs.existsSync(this.#entirePath)){
            fs.mkdirSync(this.#entirePath);
        }
    }

    #getPath(tableName){
        return `${this.#entirePath}${AlphaUtils.formatTableName(tableName)}${this.#extension}`;
    }

    /**
     * Create a new flat-file table.
     * @param {string} tableName The name for the table. Spaces will be replaced with underscores, and other non-valid file name symbols will be removed.
     * @returns {boolean} If the operation was successful or not.
     */
    create(tableName){
        const tablePath = this.#getPath(tableName);

        if(!fs.existsSync(tablePath)){
            fs.writeFileSync(tablePath, "");
            return true;
        }

        return false;
    }

    /**
     * Delete a flat-file table.
     * @param {string} tableName The name for the table. Spaces will be replaced with underscores, and other non-valid file name symbols will be removed.
     * @returns {boolean} If the operation was successful or not.
     */
    delete(tableName){
        const tablePath = this.#getPath(tableName);
        if(fs.existsSync(tablePath)){
            fs.unlinkSync(tablePath);
        }

        return false;
    }

    /**
     * List all of the tables within the instance of the database.
     * @param {boolean} asArray If to return an array or not. 
     * @returns {string|string[]} Each of the tables.
     */
    list(asArray = false){
        const files = fs.readdirSync(this.#entirePath);
        const tables = [];
        for(const file of files){
            if(file.endsWith(this.#extension)){
                tables.push(file.replace(this.#extension, ""));
            }
        }

        // The reason I don't return it as an array by default is because this is the way it was done before. I don't wanna break compatibility.
        return asArray ? tables : tables.join("\n");
    }

    /**
     * Write a new row to the table.
     * @param {string} tableName The name of the table to write a row to.
     * @param {string|object} values The values to write to the table. Can support the raw string or an object.
     * @returns {boolean} If the operation was successful or not.
     */
    write(tableName, values){
        if(Array.isArray(values)){
            return this.writearr(tableName, values);
        }

        if(typeof values === "object"){
            const entries = Object.keys(values).map(key => `${key}=${values[key]}`);
            values = entries.join(" ");
        }

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            if(!this.create(tablePath)){
                // something went wrong
                return false;
            }
        }

        values = encodeURI(values);
        const contents = fs.readFileSync(tablePath, "utf-8");
        fs.writeFileSync(tablePath, contents === ""
            ? values
            : `${values}\n${contents}`
        );

        return true;
    }

    /**
     * Overwrite a row in the table.
     * @param {string} tableName The name of the table to read from.
     */
    rewrite(tableName, values){
        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return false;
        }

        const newRows = [];

        const contents = fs.readFileSync(tablePath, "utf-8");
        const entries = values.split(" ");
        const [searchKey, searchValue] = entries[0].split("=");

        const rows = contents.split("\n");
        for(const row of rows){
            const rowEntries = decodeURI(row).split(" ");
            const [compareKey, compareValue] = rowEntries[0].split("=");

            if(searchKey === compareKey && searchValue === compareValue){
                const object = {};
                for(const rowEntry of rowEntries){
                    const [key, value] = rowEntry.split("=");
                    object[key] = value;
                }

                for(const entry of entries){
                    const [key, value] = entry.split("=");
                    object[key] = value;
                }

                const newRow = Object.keys(object).map(key => `${key}=${values[key]}`);
                newRows.push(encodeURI(newRow.join(" ")));
            }
        }

        fs.writeFileSync(tablePath, `${newRows.join("\n")}\n${contents}`);
        return true;
    }

    /**
     * Write an array of rows to the table.
     * @param {string} tableName The name of the table to read from.
     * @param {string[]} multiValues The array of values to write.
     * @returns {boolean} If the operation was successful or not.
     */
    writearr(tableName, multiValues){
        if(!Array.isArray(multiValues)){
            return false;
        }

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return false;
        }

        let stringify = [];
        for(let value of multiValues){
            if(typeof value === "object"){
                const entries = Object.keys(value).map(key => `${key}=${value[key]}`);
                value = entries.join(" ");
            }

            stringify.push(encodeURI(value));
        }

        const values = stringify.join("\n");
        const contents = fs.readFileSync(tablePath, "utf-8");
        fs.writeFileSync(tablePath, contents === ""
            ? values
            : `${values}\n${contents}`
        );

        return true;
    }

    /** 
     * Delete a row by search.
     * @param {string} tableName The name of the table to read from.
     * @param {boolean} search The search values.
     */
    rowdelete(tableName, values, search = false, inverted_search = false){
        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return false;
        }

        let success = false;
        let contents = fs.readFileSync(tablePath, 'utf8');
        let pairs2 = values.split(" ");
        let first2 = pairs2[0].split("=");
        let rows = contents.split("\n");
        let new_content = "";
        for(let row of rows){
            if(rows.length !== 0){
                let rowpairs = decodeURI(row).split(" ");
                let found = false;
                for(let rowpair of rowpairs){
                    let first1 = rowpair.split("=");
                    if(inverted_search === true){
                        if(search === true){
                            if(first1[0] === first2[0] && first1[1].includes(first2[1]) === false){ success = true; found = true; }
                        } else {
                            if(first1[0] === first2[0] && first1[1] !== first2[1]){ success = true; found = true;}
                        }
                    } else {
                        if(search === true){
                            if(first1[0] === first2[0] && first1[1].includes(first2[1]) !== false){ success = true; found = true; }
                        } else {
                            if(first1[0] === first2[0] && first1[1] === first2[1]){ success = true; found = true;}
                        }
                    }
                }
                if(found === false){
                    new_content = new_content+row+"\n";
                }
            }
        }
        
        if(success){
            let f = fs.openSync(tablePath, "w");
            fs.writeSync(f, new_content)
            fs.closeSync(f);
        }

        return success;
    }

    /**
     * Read a row from the table.
     * @param {string} tableName The name of the table to read from.
     * @param {string|string[]} search The subject to search for.
     * @param {string|string[]} columnsToReturn The columns to return. Supports both a string that has spaces between column names, and an array of column names.
     * @returns {any}
     */
    read(tableName, search, columnsToReturn){
        if(typeof columnsToReturn === "string"){
            columnsToReturn = columnsToReturn.split(" ");
        }

        if(!Array.isArray(columnsToReturn)){
            return [];
        }

        if(typeof search === "string"){
            search = search.split(" ");
        }

        if(!Array.isArray(search)){
            return [];
        }

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return [];
        }

        const contents = fs.readFileSync(tablePath, "utf-8");
        const rows = contents.split("\n");
        const results = [];
        for(const row of rows){
            if(row === ""){
                // this really isn't my favorite functionality, but it is original functionality.
                break;
            }

            const columns = decodeURI(row).split(" ");
            let rowMatches = false;
            for(const column of columns){
                if(search.length === 0){
                    rowMatches = true;
                    continue;
                }

                const [key, value] = column.split("=");
                for(const s of search){
                    const [searchKey, searchValue] = s.split("=");
                    if(key === searchKey && value === searchValue){
                        rowMatches = true;
                    }
                }
            }

            if(rowMatches){
                const matches = columnsToReturn.map(toReturn => {
                    for(const column of columns){
                        const [key, value] = column.split("=");
                        if(toReturn === key){
                            return `${key}=${value}`
                        }
                    }
                    return undefined;
                });
                results.push(matches.join(" "));
            }
        }

        return results;
    }

    /**
     * Get the names of all the columns of a specific row index.
     * @param {string} tableName The name of the table to read from.
     * @param {number} rowIndex The index of the row to get names from.
     */
    column_names(tableName, rowIndex){
        const names = [];

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return names;
        }

        const contents = fs.readFileSync(tablePath, "utf-8");
        const rows = contents.split("\n");
        if(rowIndex < rows.length){
            const row = decodeURI(rows[rowIndex]);
            const [key, value] = row.split(" ");
            names.push(key);
        }

        return names;
    }

    /**
     * Get the values of all the columns of a specific row index.
     * @param {string} tableName The name of the table to read from.
     * @param {number} rowIndex The index of the row to get values from.
     */
    column_values(tableName, rowIndex){
        const values = [];

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return values;
        }

        const contents = fs.readFileSync(tablePath, "utf-8");
        const rows = contents.split("\n");
        if(rowIndex < rows.length){
            const row = decodeURI(rows[rowIndex]);
            const [key, value] = row.split(" ");
            values.push(value);
        }

        return values;
    }

    /**
     * Get the total amount of rows in a table.
     * @param {string} tableName The name of the table to read from.
     */
    rows(tableName){
        let length = 0;

        const tablePath = this.#getPath(tableName);
        if(!fs.existsSync(tablePath)){
            return length;
        }

        const contents = fs.readFileSync(tablePath, "utf-8");
        const rows = contents.split("\n");
        for(const row of rows){
            if(row !== ""){
                length++;
            }
        }

        return length;
    }

    /**
     * Get the column value from the row by index or key.
     * @param {string} row The CSV returned row from Alpha.read.
     * @param {number|string} index The index or key to get the value by.
     * @returns {string} The gotten value.
     */
    column(row, index){
        const entries = row.split(" ");
        const columns = [];
        for(const entry of entries){
            columns.push(decodeURI(entry).split("="));
        }

        // get by index number
        if(typeof index === "number"){
            if(index < columns.length){
                return columns[index][1];
            }
        }

        // get by column name
        if(typeof index === "string"){
            for(const [key, value] of columns){
                if(key === index){
                    return value;
                }
            }
        }

        return "";
    }

    /** 
     * Encode so that it doesn't interfere with the Alpha formatting.
     * @param {string} value The string to be encoded.
     * @returns {string} The encoded value.
     */
    en(value){
        return AlphaUtils.encode(value);
    }

    /** 
     * Decode a previously encoded value.
     * @param {string} value The string to be decoded.
     * @returns {string} The original value.
     */
    de(value){
        return AlphaUtils.decode(value);
    }

    /**
     * Print something safe (legacy code, keep original functionality).
     * @param {string} value The thing to be "printed" safe.
     * @returns {string} The cleaned value.
     */
    printsafe(value){
        value.replace(/</g, "&gt;")
             .replace(/>/g, "&lt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&apos;");
        
        return value;
    }
}

module.exports = Alpha;