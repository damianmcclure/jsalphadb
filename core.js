// ================================== Welcome to jsAlphaDB! ======================================= //
//
//  Author: Mcclures
//  Version: 1.0
//
//  Description:
//      This is a JavaScript Remake of the flatfile database system made by JQuery
//      The purpose is to create a basic, easy to learn & use flat database system for applications
//
//  Installation & Setup:
//      1) Change the variables key and this.ext to as you see fit.
//      2) Make sure node can write to the file system.
//
//  License:
//      WTFPL - http://www.wtfpl.net/
// ================================================================================================ //

const fs = require("fs");

function db_empty(name){
    var fd = fs.openSync(name, 'w');
    fs.closeSync(fd);
}

class jsAlphaDB {
    constructor(key, extension){
        this.ext = extension;
        this.entire_path = "./databases/"+key+"/";

        if(!fs.existsSync("./databases/")){
            fs.mkdirSync("./databases/");
        }
    
        if(!fs.existsSync(this.entire_path)){
            fs.mkdirSync(this.entire_path);
        }
    }

    /* === Export Functions === */
    create(value_name){
        // Spaces will be replaced with (_) underscores
        var success = false;
        var value_name = value_name.replace(" ", "_");
        if(!fs.existsSync(this.entire_path+value_name+this.ext)){
            db_empty(this.entire_path+value_name+this.ext);
            success = true;
        }
        return success;
    }

    delete(value_name){
        // Spaces will be replaced with (_) underscores
        var success = false;
        var value_name = value_name.replace(" ", "_");
        if(fs.existsSync(this.entire_path+value_name+this.ext)){
            fs.unlinkSync(this.entire_path+value_name+this.ext);
            success = true;
        }
        return success;
    }

    list(){
        var items = fs.readdirSync(this.entire_path);
        var reg = new RegExp(this.ext, "g");
        return items.join("\n").replace(reg, "");
    }

    write(db_name, values){
        var success = false;
        if(fs.existsSync(this.entire_path+db_name+this.ext)){
            var contents = fs.readFileSync(this.entire_path+db_name+this.ext, 'utf8');
            var err = false;
            var empty = false;
            if(contents === ""){
                empty = true;
            } else {
                var rows = contents.split("\n");
                for(var row of rows){
                    row = decodeURI(row);
                    var dat = row.split(" ");
                    dat = dat[0];
                    dat = dat.split("=");
                    dat = dat[1];
                    var dat2 = dat.split(" ");
                    dat2 = dat2[0];
                    dat2 = dat2.split("=");
                    dat2 = dat2[1];
                    if(dat === dat2){
                        err = true;
                        break;
                    }
                }
            }
            if(err === false){
                var f = fs.openSync(this.entire_path+db_name+this.ext, "w");
                if(empty){fs.writeSync(f, encodeURI(values));}
                else {fs.writeSync(f, encodeURI(values)+"\n"+contents);}
                fs.closeSync(f);
                success = true;
            } else {

            }
        }
        return success;
    }

    rewrite(db_name, values){
        var success = false;
    }

    writearr(db_name, values, reversed){
        var success = false;
    }

    rowdelete(db_name, values, search=false, inverted_search=false){
        var success = false;
    }

    read(db_name, search, rowreturn){
        if(fs.existsSync(this.entire_path+db_name+this.ext)){
            var contents = fs.readFileSync(this.entire_path+db_name+this.ext, 'utf8');
            var rows = contents.split("\n");
            var return_array = [];
            var result = "";
            for(var row of rows){
                if(row.length > 0){continue;}
                row = decodeURI(row);
                var col_arr = row.split(" ");
                var search_arr = search.split(" ");
                var field_arr = rowreturn.split(" ");
                for(var col of col_arr){
                    var pair1 = col.split("=");
                    var name1 = pair1[0];
                    var value1 = pair1[1];
                }
            }
        }
    }

    column_names(db_name, row_num){

    }

    column_values(db_name, row_num){

    }

    rows(db_name){

    }

    column(row, int){

    }

    en(str){
        var encoded = "encoded:";
        encoded = encoded+new Buffer(str).toString('base64');
        encoded = encoded.replace(/=/g, "^");
        return encoded;
    }

    de(str){
        var decoded = str.replace("encoded:", "");
        var decoded = decoded.replace(/\^/g, "=");
        var decoded = new Buffer(decoded, 'base64').toString('ascii');
        return decoded;
    }

    printsafe(str){
        // There is really no point to this, unless you are making a WebServer/Something that uses HTML
        str = str.replace(/</g, "&gt;");
        str = str.replace(/>/g, "&lt;");
        str = str.replace(/"/g, "&quot;");
        str = str.replace(/'/g, "&apos;");
        return str;
    }
}


module.exports = jsAlphaDB;
