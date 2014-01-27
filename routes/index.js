/**
 * Created by ELatA on 14-1-26.
 */

/**
 * 路由分发，和日志打印日志
 */

var sign = require('./sign');
var user = require('./user');
module.exports = function(app){
    app.get('/',function(req,res){
        res.redirect('/user/login');
    });

    user.routes(app);
    sign.routes(app);
    //final
    printAppRoutes(app);
}

function printAppRoutes(app){
    //稍微复杂的时候这里倒是可以写一个简单的路由加载器
    for(var method in app.routes){
      for(var key in app.routes[method]){
          var route = app.routes[method][key];
          console.log(method,route.path);
         // console.log(method,route.path,route.callbacks[0]);
      }
    }
}
