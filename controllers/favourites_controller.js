var models = require('../models/models.js');

exports.update=function(req,res,next){
	req.user.addFavs(req.quiz).then(function(){
		res.redirect(req.session.redir.toString());
	});
};

exports.destroy=function(req,res,next){
	req.user.removeFavs(req.quiz).then(function(){
		res.redirect(req.session.redir.toString());
	});
};

exports.index=function(req,res,next){
	req.user.getFavs().then(function(quizes){
		quizes.forEach(function(quiz){
			quiz.fav=true;
		});
		req.session.redir="/user/"+req.user.id+"/favourites";
		res.render('quizes/index',{quizes: quizes, errors: []});
	}).catch(function(error){next(error)});
};