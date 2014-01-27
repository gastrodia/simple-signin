/**
 * Created by ELatA on 14-1-26.
 */
var conn = require('../db').connection;
var moment = require('moment');

exports.routes = function(app){
    app.get('/sign/sign_in',function(req,res){
        res.render('sign_in',{title:'签到页面'});
    });
    app.get('/sign/sign_history',function(req,res){
        res.render('sign_history',{title:'签到历史'});
        conn.query('select * from user',function(err, rows, fields){
            //console.log(err,rows,fields);
        })
    });
    app.post('/sign/sign_in',function(req,res){

        var sign_moment = moment();
        var should_sign_moment = moment({hour: 9, minute: 0});
        var today = moment({year:should_sign_moment.year(),mouth:should_sign_moment.month(),day:should_sign_moment.date()});
        var sign_status = "正常";
        if(sign_moment.isAfter(should_sign_moment)){
            sign_status = "迟到";
        };

        var sign  = {
            userid:req.session.user.id,
            is_sign_in:1,
            sign_time:sign_moment.toDate(),
            sign_date:today.toDate(),
            should_sign_time:should_sign_moment.toDate(),
            sign_status:sign_status
        };
        var query = conn.query('insert into sign set ?',sign , function(err, result) {
            // Neat!
            console.log(err,result);
            if(err){
                console.log(err);
                res.send({err:err});
            }else{
                res.send({ success: 'json' });
            }
        });
        console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
    });
}

