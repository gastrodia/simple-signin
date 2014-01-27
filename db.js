/**
 * Created by ELatA on 14-1-27.
 */
var mysql      = require('mysql');

var db_options = {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'simple_signin'
};

exports.connection  = mysql.createConnection(db_options);
exports.options = db_options;

var conn = mysql.createConnection(db_options);
/*conn.query("select * from user where username = 'aaa'",function(err,rows,fields){
    console.log(err,rows,fields);
});*/

/*
conn.query("insert into user set ?",{username:"moyang",password:"1234",email:"bbb"},function(err, result){
    if (err) throw err;
    console.log(result.insertId);

});*/
