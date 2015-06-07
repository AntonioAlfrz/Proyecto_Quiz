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
exports.destroy = function(req, res, next) {
	req.user.destroy().then( function() {
		if(req.session.user.isAdmin){
			res.redirect(req.session.redir.toString());
		}
		delete req.session.user;
		res.redirect('/');
	}).catch(function(error){next(error)});
};

// GET /formpass/:rand
exports.formpass = function(req,res, next){
	models.User.find({
		where: {
			secret: req.params.rand,
		}
	}).then(function(user){
		if(user){
			res.render('user/formpass', {rand: req.params.rand, errors: []});
		}else{
			res.render('mensaje',{errors: [], mensaje: "Ruta no válida"})
		}
	}).catch(function(error){
		next(error);
	})
}

// PUT /formpass/:rand
exports.changepass = function(req,res, next){
	if(req.body.pass===""){
		res.render('user/formpass',{rand: req.params.rand, errors: [{message: "Contraseña vacía"}]});
		return;
	}
	models.User.find({
		where: {
			secret: req.params.rand
		}
	}).then(function(user){
		if(req.body.pass===req.body.passcheck){
			user.password=req.body.pass;
			user.validate().then(function(err){
				if (err) {
					res.render('user/formpass', {rand: req.params.rand, user: req.user, errors: err.errors});
				} else {
					user.save( {fields: ["password"]}).then( function(){
						res.render('mensaje', {errors: [], mensaje: "Contraseña cambiada correctamente"});
					});
				}
			}).catch(function(error){next(error)});
		}else{
			res.render('user/formpass', {rand: req.params.rand, errors: [{message: "Las contraseñas no son iguales"}]});
		}
	}).catch(function(error){
		next(error);
	})
}

// GET /resetPass
exports.resetPass = function(req,res) {
	res.render('user/reset', {errors: []});
}

// GET /sent
exports.sentPass = function(req,res,next){
	if(req.query.username===""){
		res.render('user/reset',{errors: [{message: "Introduzca usuario"}]});
		return;
	}
	if(req.query.email===""){
		res.render('user/reset',{errors: [{message: "Introduzca email"}]});
		return;
	}
	models.User.find({
		where: {
			username: req.query.username,
		}
	}).then(function(user){
		if(user){
			if(user.email===req.query.email){
				var options={
					to : req.query.email,
					subject : "Reseteo contraseña",
					text : "Nombre de usuario: "+req.query.username+
					"\n Acceda al link para cambiar la contraseña: "+
					"https://quiz-alfrz.herokuapp.com/formpass/"+user.secret
				};
				send_Email(options, function(error, response){
					if(error){
						console.log("Error: "+error);
						next(error);
						return;
					}
					res.render('mensaje', { mensaje: "Revise su correo", errors: []});
				})
			}else{
				res.render('user/reset',{errors: [{message: "Email no corresponde al usuario"}]});
				return;
			}
		}else{
			res.render('user/reset',{errors: [{message: "Usuario no válido"}]});
			return;
		}
	}).catch(function(error){
		next(error);
	});
}

// GET /gestion
exports.adminView = function(req,res){
	if(req.session.user.isAdmin){
		models.User.findAll({
			where: {
				isAdmin: false,
				username:{
					$not: req.session.user.username
				}
			}
		}).then(function(users){
			res.render('user/adminView', {users: users, errors: []});
		}).catch(function(error){
			next(error);
		});
	}else{
		res.redirect('/');
	}
};

// GET /user/verify
exports.verify = function(req,res){
	res.render('user/verify', {errors: []});
};

// POST /user/verify
exports.verificado = function(req,res,next){
	models.User.find({
		where: {
			username: req.body.username
		}
	}).then(function(user){
		if(user){
			if(req.body.secret===user.secret){

				user.verified=true;
				user.save( {fields: ["verified"]}).then( function(){
					req.session.user = {id:user.id, username:user.username, isAdmin: user.isAdmin};
					res.render("mensaje",{mensaje: "Usuario verificado", errors: []});
				}).catch(function(error){next(error)});	
			}else{
				res.render("user/verify", {errors: [{message: "Número secreto no válido"}]});
			}
		}else{
			res.render("user/verify", {errors: [{message: "No existe usuario"}]});
		}
		
	});
};

//POST /user
exports.create = function(req, res, next){
	var rand = require('crypto').randomBytes(16).toString('hex');
	var mailOptions={
		to : req.body.user.email,
		subject : "Confirma la cuenta para Quiz",
		text : "Nombre de usuario: "+req.body.user.username+
		"\n Copia el código para confirmar tu cuenta: "+rand
		+ "\n Para confirmar https://quiz-alfrz.herokuapp.com/user/verify" ,
	};

	var user = models.User.build( req.body.user );
	user.secret = rand;
	user.validate().then(function(err){
		if (err) {
			res.render('user/new', {user: user, errors: err.errors});
		} else {
			user.save({fields: ["username", "password","email","secret"]})
			.then( function(){
				send_Email(mailOptions, function(error, response){
					if(error){
						console.log("Error: "+error);
						next(error);
						return;
					}
					res.redirect('/');
				})
			}).catch(function(error){next(error)});
		}
	});
}

send_Email = function(options, callback){
	var nodemailer = require("nodemailer");
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'reinacotillarugp@gmail.com',
			pass: process.env.PASSWORD_EMAIL
		}
	});
	transporter.sendMail(options, callback);
}