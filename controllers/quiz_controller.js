var models = require('../models/models.js');

// Admin-> Todo, Usuario -> Sólo propietario
exports.ownershipRequired = function(req, res, next){
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

// Autoload
exports.load=function(req,res,next,quizId){
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(function(quiz){
		if(quiz){
			req.quiz=quiz;
			next();
		}else{
			next(new Error('No existe quizId= '+quizId));
		}
	}).catch(function(error){
		next(error);
	});
};

// GET /quiz/:id
exports.show = function (req,res){
	var bool;
	if(req.session.user){
		req.quiz.getFavs().then(function(users){
			bool=users.some(function(user){
				return user.id===req.session.user.id;
			});
			console.log(bool);
			res.render('quizes/show',{quiz: req.quiz, errors: [], fav: bool});
		}).catch(function(error){next(error)});
	}else{
		res.render('quizes/show',{quiz: req.quiz, errors: [], fav:bool});
	}
	
};

// GET /quizes/:id/answer
exports.answer = function(req,res){
	var resultado='Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado='Correcto';
	}
	res.render('quizes/answer',
		{quiz: req.quiz,
			respuesta: resultado,
			errors: []
		});
};

// GET /quizes
exports.index = function(req,res,next){
	var favs=[];
	var options = {};
	options.where={};
	if(req.session.user){
		options.include = [{ model: models.User, as: "Favs"}];
	}
	if(req.user){
		options.where.UserId = req.user.id;
	}
	if (req.query.search !== "" && req.query.search!==undefined){
		var search= '%' +(String(req.query.search)).replace(/\s/g,"%")+'%';
		options.order = ['pregunta'];
		options.where.pregunta ={$like: search};
	}
	models.Quiz.findAll(options).then(function(quizes){
		if(req.session.user){
			quizes.forEach(function(quiz){
				quiz.fav=quiz.Favs.some(function(user){
					return user.id===req.session.user.id;
				});
			});
		}
		res.render('quizes/index.ejs', {quizes: quizes, errors: []});
	}).catch(function(error){next(error)});
	
};

//GET /quizes/new
exports.new = function(req,res){
	var quiz = models.Quiz.build(
		{pregunta: "", respuesta: ""}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req,res){
	req.body.quiz.UserId = req.session.user.id;
	if(req.files.image){
		req.body.quiz.image = req.files.image.name;
	}
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(function(err){
		if(err){
			res.render('quizes/new',{quiz: quiz, errors: err.errors});
		}else{
			quiz.save({fields: ["pregunta", "respuesta", "UserId","image"]}).then(function(){
				res.redirect('/quizes');
			});
		}
	}).catch(function(error){
		next(error);
	});
};

// GET /quizes/:id/edit
exports.edit = function(req,res){
	var quiz = req.quiz;
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	if(req.files.image){
		req.quiz.image = req.files.image.name;
	}
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz.validate().then(function(err){
		if (err) {
			res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		} else {
			req.quiz.save(
				{fields: ["pregunta", "respuesta", "image"]})
			.then( function(){ res.redirect('/quizes');});
		}
	}).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req,res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};