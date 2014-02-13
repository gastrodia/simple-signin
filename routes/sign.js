/**
 * Created by ELatA on 14-1-26.
 */
var conn = require('../db').connection;
var moment = require('moment');

exports.routes = function(app){
    app.get('/sign/nowSysTime',function(req,res){
        var this_moment = moment();
        var nowTime = this_moment.format("YYYY-MM-DD HH:mm");
        res.json({nowTime:nowTime});
    })
    app.get('/sign/sign_in',function(req,res){
        hasSignIn = false;
        hasSignOut = false;
        var this_moment = moment();
        var today = moment({year:this_moment.year(),month:this_moment.month(),day:this_moment.date()});
        today_str = today.format("YYYY-MM-DD HH:mm:ss:SSS");
        var sql = "select * from sign where sign_date = '" + today_str + "' and is_sign_in = 1 and userid = " + req.session.user.id;
        console.log(sql);
        conn.query(sql,function(err,rows){
            if(rows.length>0){
                hasSignIn = true;
            }
            var sql = "select * from sign where sign_date = '" + today_str + "' and is_sign_in = 0 and userid = " + req.session.user.id;
            conn.query(sql,function(err,rows){
                if(rows.length>0){
                    hasSignOut = true;
                }
                res.render('sign_in',{title:'签到页面',hasSignIn:hasSignIn,hasSignOut:hasSignOut,now_str:this_moment.format("YYYY-MM-DD HH:mm"),user:req.session.user});
            });
        })

    });
    app.get('/sign/sign_history',function(req,res){

        function formatRows(rows){

            function rows2dict(){
                var signRecordDict = {};
                for(var k in rows){
                    var dbSignRecord = rows[k];
                    var dateKey = moment(dbSignRecord.sign_date).unix() + "";
                    if(signRecordDict[dateKey]){
                        var signRecord = signRecordDict[dateKey];
                        updateRecord(signRecord,dbSignRecord);
                    }else{
                        signRecordDict[dateKey] = {
                            signDate:dbSignRecord.sign_date
                        }
                        updateRecord(signRecordDict[dateKey],dbSignRecord);
                    }
                }
                return signRecordDict;
            }
            function formatRecord2Json(record){
                var signJson = {
                    signDate:"YYYY-MM-DD",
                    signInTime:"YYYY-MM-DD HH:mm",
                    signOutTime:"YYYY-MM-DD HH:mm",
                    signStatus:"正常"
                }
                signJson.signDate = moment(record.signDate).format(signJson.signDate);
                if(record.signInTime){
                    signJson.signInTime = moment(record.signInTime).format(signJson.signInTime);
                }else{
                    signJson.signInTime = "";
                }
                if(record.signOutTime){
                    signJson.signOutTime = moment(record.signOutTime).format(signJson.signOutTime);
                }else{
                    signJson.signOutTime = "";
                }
                signJson.signStatus = record.signStatus;
                return signJson;
            }
            function updateRecord(signRecord,dbSignRecord){
                var dbSignStatus = dbSignRecord.sign_status;
                var signStatus = signRecord.signStatus;
                if(!signStatus){
                    signStatus = dbSignStatus;
                }else{
                    if( dbSignStatus!= "正常" && signStatus == "正常"){
                        signStatus == dbSignStatus;
                    }
                    if(dbSignStatus != "正常" && signStatus != "正常"){
                        signStatus  += " + " + dbSignStatus;
                    }
                }
                signRecord.signStatus = signStatus;
                if(dbSignRecord.is_sign_in){
                    signRecord.signInTime = dbSignRecord.sign_time;
                }else{
                    signRecord.signOutTime = dbSignRecord.sign_time;
                }
            }

            var signList = [];
            var dict = rows2dict(rows);
            for(var k in dict){
                var record = dict[k];
                var signJson = formatRecord2Json(record);
                signList.push(signJson);
            }

            return signList;
        }
        conn.query('select * from sign where  userid = ' + req.session.user.id,function(err, rows, fields){
            var signList = formatRows(rows);
            var this_moment = moment();
            res.render('sign_history',{title:'签到历史',signList:signList,now_str:this_moment.format("YYYY-MM-DD HH:mm"),user:req.session.user});
        })
    });
    app.post('/sign/sign_in',function(req,res){

        var sign_moment = moment();
        var should_sign_moment = moment({hour: 9, minute: 0});
        var today = moment({year:should_sign_moment.year(),month:should_sign_moment.month(),day:should_sign_moment.date()});
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

    });
    app.post('/sign/sign_in',function(req,res){

        var sign_moment = moment();
        var should_sign_moment = moment({hour: 9, minute: 0});
        var today = moment({year:should_sign_moment.year(),month:should_sign_moment.month(),day:should_sign_moment.date()});
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
    app.post('/sign/sign_out',function(req,res){

        var sign_moment = moment();
        var should_sign_moment = moment({hour: 18, minute: 0});
        var today = moment({year:should_sign_moment.year(),month:should_sign_moment.month(),day:should_sign_moment.date()});
        var sign_status = "正常";
        if(sign_moment.isBefore(should_sign_moment)){
            sign_status = "早退";
        };

        var sign  = {
            userid:req.session.user.id,
            is_sign_in:0,
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

