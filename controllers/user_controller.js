var models = require('../models/models.js');

// Admin-> Todo, Usuario -> Sólo propietario
exports.ownershipRequired = function(req, res, next){
	var objUser = req.user.id;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if (isAdmin || objUser === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

// Autoload :id
exports.load = function(req, res, next, userId) {
	models.User.find({
		where: {
			id: Number(userId)
		}
	}).then(function(user) {
		if (user) {
			req.user = user;
			next();
		} else{next(new Error('No existe userId=' + userId))}
	}).catch(function(error){next(error)});
};

// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function(login, password, callback) {
	models.User.find({
		where: {
			username: login
		}
	}).then(function(user){
		if(user){
			if(user.verified){
				if(user.verifyPassword(password)){
					callback(null,user);
				}else{
					callback(new Error('Password erróneo')); 	
				}
			}else{
				callback(new Error('Usuario no verificado'));
			}	
		}else{
			callback(new Error('No existe el usuario ' + login));
		}
	}).catch(function(error){
		callback(error);
	});
};

// GET /user/:id/edit
exports.edit = function(req, res) {
	res.render('user/edit', { user: req.user, errors: []});
};

// PUT /user/:id
exports.update = function(req, res, next) {
	req.user.username  = req.body.user.username;
	req.user.password  = req.body.user.password;

	req.user.validate().then(function(err){
		if (err) {
			res.render('user/edit', {user: req.user, errors: err.errors});
		} else {
			req.user
			.save( {fields: ["username", "password"]})
			.then( function(){ res.redirect('/');});
		}
	}).catch(function(error){next(error)});
};

// GET /user
exports.new = function(req, res) {
	var user = models.User.build(
		{username: "", password: ""}
		);
	res.render('user/new', {user: user, errors: []});
};

// DELETE /user/:id
exports.destroy = function(req, res) {
	req.user.destroy().then( function() {
		delete req.session.user;
		res.redirect('/');
	}).catch(function(error){next(error)});
};

exports.verify = function(req,res){
	res.render('user/verify', {errors: []});
};

exports.verificado = function(req,res,next){
	models.User.find({
		where: {
			username: req.body.username
		}
	}).then(function(user){
		if(user){
			if(Number(req.body.secret)===user.secret){

				user.verified=true;
				user.save( {fields: ["verified"]}).then( function(){
					res.render("Usuario verificado");
				}).catch(function(error){next(error)});	
			}else{
				next(new Error("Número secreto no válido"));
			}
		}else{
			next(new Error('No existe usuario: ' + req.body.username));
		}
		
	});
};

exports.create = function(req, res){
	var rand=Math.floor( Math.random() * 100 );
	var nodemailer = require("nodemailer");
	var smtpTransport = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "reinacotillarugp@gmail.com",
			pass: "quizalfrz"
		}
	});

	var mailOptions={
		to : req.body.user.email,
		subject : "Confirma la cuenta para Quiz",
		text : "Número secreto para confirmar tu cuenta: "+rand
		+ ".\n Para confirmar https://192.168.157.136:5000/verify" ,
	};
	console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log("Error " +error);
			next(error);
			return;
		}else{
			var user = models.User.build( req.body.user );
			user.secret = rand;
			console.log("Usuario" + user);
			user.validate().then(function(err){
				if (err) {
					res.render('user/new', {user: user, errors: err.errors});
				} else {
					user.save({fields: ["username", "password","email","secret"]})
					.then( function(){
						//req.session.user = {id:user.id, username:user.username};
						res.redirect('/');
					}); 
				}
			}).catch(function(error){next(error)});
		}
	});
}