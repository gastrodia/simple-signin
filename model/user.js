/**
 * Created by blacksun on 14-3-1.
 */

var Bookshelf = require('bookshelf');

var SimpleModel = Bookshelf.initialize({
    client:'mysql',
    connection:{
        host:'127.0.0.1',
        user:'root',
        password:'root',
        database:'simple_signin',
        charset:'utf-8'
    }
});

var User = SimpleModel.Model.extend({
    tableName:'user'
})