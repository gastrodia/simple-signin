
/*
 * GET users listing.
 */
var conn = require('../db').connection;
var validator = require('validator');
var crypto = require('crypto');
var knex = require('knex').knex;
var when = require('when');
when.pipeline = require('when/pipeline');

function isSafeUsername(username){
    if(/^[a-zA-Z]{1}([a-zA-Z0-9]){4,19}$/.exec(username)){
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
        if(username == ""||req.body.password == ""){
            req.flash('error','用户名和密码不能为空!');
            res.redirect('/user/login');
        }
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
        if(!postUser.realname){
            return err_back('真实姓名不能为空');
        }
        // [\u4E00-\uFA29]|[\uE7C7-\uE7F3]汉字编码范围
        var chineseChar = new RegExp("^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$");
        if(!chineseChar.test(postUser.realname)){
            return err_back('真实姓名中不能含有中文、数字、字母意外的字符');
        }
        if(postUser.realname.length>10||postUser.realname.length<1){
            return err_back('真实姓名只能取1-10个字');
        }
        if(!isSafeUsername(postUser.username)){
            return err_back('用户名只能输入5-20个以字母开头的数字和字母组合！ ')
        }
        if(!postUser.password){
            return err_back("请输入登录密码！");
        }
        if(postUser.password!=postUser.repasswd){
            return err_back('两次输入的密码不一致!');
        }
        if(!validator.isEmail(postUser.email)){
            return err_back("您输入的邮件格式不正确");
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');



        knex('user').where('username',postUser.username).select()
            .then(function(resp){
                if(resp.length>0){
                    return when.reject({info:'您输入的用户名已存在!',redirect:'/user/reg'});
                }else{
                    return knex('user').where('email',postUser.email).select()
                }
            })
            .then(function(resp){
                if(resp.length>0){
                    return when.reject({info:'您输入的邮箱已存在!',redirect:'/user/reg'});
                }else{
                    return knex('user').returning('id').insert({
                        username:postUser.username, password:password,
                        email:postUser.email, realname:postUser.realname
                    });
                }
            })
            .then(function(resp){
                if(resp[0]){
                    req.flash('success','注册成功，返回登录！');
                    res.redirect('/user/reg');
                };
            })
            .otherwise(function(error){
                if(error){
                    req.flash('error',error.info);
                    res.redirect(error.redirect);
                }
            })



     /*   knex('user').where('username',postUser.username).select()
            .then(function(resp){
            if(resp.length>0){
                req.flash('error','您输入的用户名已存在!');
                res.redirect('/user/reg');
            }else{
                knex('user').where('email',postUser.email).select().then(function(resp){
                    if(resp.length){
                        req.flash('error','您输入的邮箱已存在!');
                        res.redirect('/user/reg');
                    }else{
                        knex('user').returning('id').insert({
                            username:postUser.username,
                            password:password,
                            email:postUser.email,
                            realname:postUser.realname}).then(function(resp){
                                if(resp[0]){
                                    req.flash('success','注册成功，返回登录！');
                                    res.redirect('/user/reg');
                                };
                            })
                    }
                })
            }
        });
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
                              conn.query("insert into user set ?",{username:postUser.username,password:password,email:postUser.email,realname:postUser.realname},function(err, result){
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

        })*/
    });

}




