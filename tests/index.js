const Alpha = require("../core.js");

const db = new Alpha("test");

const name = "new special table !()*&$&";

console.log(db.delete(name));
console.log(db.create(name));
console.log(db.write(name, `id=${Date.now()} name=${db.en("Damian McClure")} role=admin`));
console.log(db.write(name, `id=${Date.now()} name=${db.en("John Smith")} role=user`));
console.log(db.write(name, `id=${Date.now()} name=${db.en("James Kenny")} role=user`));
console.log(db.write(name, `id=${Date.now()} name=${db.en("Jim Johnson")} role=user`));

const rows = db.read(name, "role=user", "id name role");
console.log(rows);
for(const row of rows){
    const id = db.column(row, "id");
    const name = db.de(db.column(row, 1));
    const role = db.column(row, "role");

    console.log(id, name, role);
}

console.log(db.rowdelete(name, `name=${db.en("John Smith")}`))

console.log(db.read(name, "role=admin", "id name role"));
console.log(db.read(name, "role=user", "id name role"));

console.log("=========================================");

(async () => {
    const db = new Alpha.promises("test2");
    const name = "the asynchronous one";

    console.log(await db.delete(name));
    console.log(await db.create(name));
    console.log(await db.write(name, `id=${Date.now()} name=${db.en("Damian McClure")} role=admin`));
    console.log(await db.write(name, `id=${Date.now()} name=${db.en("John Smith")} role=user`));
    console.log(await db.write(name, `id=${Date.now()} name=${db.en("James Kenny")} role=user`));
    console.log(await db.write(name, `id=${Date.now()} name=${db.en("Jim Johnson")} role=user`));

    console.log(await db.read(name, "role=user", "id name role"));

    console.log(await db.rowdelete(name, `name=${db.en("John Smith")}`))

    console.log(await db.read(name, "role=admin", "id name role"));
    console.log(await db.read(name, "role=user", "id name role"));
})();