'use strict'

const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD; 

const restify = require('restify');
const errors = require('restify-errors');

const server = restify.createServer();

/**
 * BASIC認証。
 */
server.use(restify.plugins.authorizationParser());
server.use((req, res, next) => {
    if (!req.authorization.basic || BASIC_AUTH_PASSWORD !== req.authorization.basic.password) {
        return next(new errors.NotAuthorizedError());
    }
    return next();
});

//コマンド・スタック
let stack = [];

/**
 * スタックにコマンドを1つ入れる。コマンドは小文字で登録される。
 * 登録出来た場合、Status:201を返す。それ以外は、Status:400を返す。
 */
server.post('/command/:command', (req, res, next) => {
    let command = req.params.command;
    if(command) {
        command = command.toLowerCase();
        console.log("Command Received: " + command);
        stack.push(command);
        res.send(201, command);
        return next();
    } 
    console.log("Bad Request");
    // res.status(400);
    // res.send();
    return next(new errors.BadRequestError());

});

/**
 * スタックに入っているコマンドを1つ戻す。
 * スタックが空の場合、Status:204を返す。
 */
server.get('/command', (req, res, next) => {
    if(stack.length > 0) {
        let command = stack.shift();
        console.log("Command Replied: " + command );
        res.header('Content-Type', 'text/plain');
        res.send(200, command);
    } else {
        console.log("Empty Command Stack");
        res.status(204);
        res.send();
    }
    return next();
});

/**
 * スタックに入っているコマンドを全部消す。
 * スタックが空の場合、Status:204を返す。
 */
server.del('/command', (req, res, next) => {
    stack = [];
    console.log("Stack Cleared");
    res.status(204);
    res.send();
    return next();
});

// Start the server
server.listen(process.env.PORT || 8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});