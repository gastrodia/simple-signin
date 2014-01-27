
/*
 * GET users listing.
 */
var conn = require('../db').connection;
var validator = require('validator');
var crypto = require('crypto');

function isSafeUsername(username){
    if(/^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/.exec(username)){
       return true;
    }else{
        return false;
    }
}
exports.routes = function(app){
    app.get('/user/login',function(req,res){
        res.render('login', { title: '登录页面',
            error:req.flash('error').toString() });
    });
   app.get('/user/reg', function(req,res){
        res.render('reg',{
            title:'注册页面',
            error:req.flash('error').toString(),
            success:req.flash('success').toString()
        });
    });
    app.post('/user/login',function(req,res){
        var username = req.body.username;
        if(username && isSafeUsername(username)){
            var md5 = crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('hex');
            var sql = "select * from user where username ='" + username +"' and password = '" + password + "'";
            conn.query(sql,function(err,result){
                if(!err && result.length>0){
                    req.session.user = result[0];
                    res.redirect("/sign/sign_in");
                }else{
                    req.flash('error','用户名或密码不正确!');
                    res.redirect('/user/login');
                }
            })
        }
    });
    app.post('/user/reg',function(req,res){
        console.log("post");
        function err_back(msg){
            req.flash('error',msg);
            return res.redirect('/user/reg');
        }

        var postUser = req.body;
        if(!postUser.username){
            return err_back('用户名不能为空');
        }
        if(!isSafeUsername(postUser.username)){
            return err_back('用户名只能输入5-20个以字母开头、可带数字、“_”、“.”的字串 ')
        }
        if(!postUser.password){
            return err_back("请输入登录密码！")
        }
        if(postUser.password!=postUser.repasswd){
            return err_back('两次输入的密码不一致!');
        }
        if(!validator.isEmail(postUser.email)){
            return err_back("您输入的邮件格式不正确");
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');

        conn.query("select * from user where username = '" + postUser.username + "'",function(err,rows){
            if(err){
                console.log(err);
            }else{
                console.log(rows == true)
                if(rows.length>0){
                    req.flash('error','您输入的用户名已存在!');
                    res.redirect('/user/reg');
                }else{
                    conn.query("select * from user where email = '"  + postUser.email + "'",function(err,row){
                      if(err){
                        console.log(err);
                      }else{
                          if(row.length>0){
                              req.flash('error','您输入的邮箱已存在!');
                              res.redirect('/user/reg');
                          }else{
                              conn.query("insert into user set ?",{username:postUser.username,password:password,email:postUser.email},function(err, result){
                                  if (err) throw err;
                                  if(result.insertId){
                                      req.flash('success','注册成功，返回登录！');
                                      res.redirect('/user/reg');
                                  };
                              });
                          }
                      }
                    })
                }
            }

        })
    });

}




