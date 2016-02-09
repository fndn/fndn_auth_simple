require('dotenv').load();

var DEBUG 			= 10;
var chalk  			= require('chalk');
var tokens 			= process.env.TOKENS;
var valid_tokens 	= tokens ? tokens.split(",") : [];


module.exports.init = function(app, conf){

	DEBUG = conf.debug || 10;

	console.log( chalk.green("Enabling Simple Auth") );
	if(DEBUG>2){
		console.log( chalk.green(" with tokens:"), valid_tokens );
	}

	app.use( function(req, res, next){
		
		if(DEBUG>2) console.log('⌥ req.headers.x-forwarded-for', req.headers['x-forwarded-for'], 'req.connection.remoteAddress:', req.connection.remoteAddress);

		var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if(DEBUG>2) console.log('⌥ remote_ip:', remote_ip );

		var token = req.headers['x-auth-token'];
		if(DEBUG>2) console.log('⌥ token:', token );
		//console.log('req.headers', req.headers );

		if( req.path.split("/")[1] === 'pub' ){
			if(DEBUG) console.log("⌥ auth: bypassing auth for public endpoints");
			next();

		}else if( remote_ip.indexOf('127.0.0.1') > -1 || remote_ip.indexOf('169.254.') > -1 || remote_ip == '::1'  ){
			if(DEBUG) console.log("⌥ auth: bypassing auth for localhost");
			next();
		
		}else if( valid_tokens.indexOf(token) > -1 ){
			if(DEBUG) console.log("⌥ auth: access allowed by token");
			next();

		}else{
			console.log( "⌥ auth: "+ chalk.red("access denied") +" from remote_ip:", remote_ip);
			res.send({"status":"error", "msg":"access denied"});
		}
	});
};