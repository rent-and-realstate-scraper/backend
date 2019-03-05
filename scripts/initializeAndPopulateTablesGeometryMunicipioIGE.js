const DataAccess = require('../managers/MysqlDataAccess');

const fs = require('fs');

require('dotenv').load();

(async () => {
    const db = new DataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
    const sqlScriptPath ="initalize_and_import_geo_data_IGN.sql";
    const localPath = __dirname;

    let sql = fs.readFileSync(sqlScriptPath, 'utf8');
    sql = sql.replace(/LOCALPATH/g, localPath);

    console.log("creating table and popullating...");
    try{
        await db.runQuery(sql);
    } catch(err){
        console.log(err);
    }
    console.log("created and popullated");
    process.exit()
})()
