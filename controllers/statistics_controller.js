var models = require('../models/models.js');

exports.load = function(req,res){ 
	models.Quiz.count().then(function(quizes){
		models.Comment.count({where: {publicado: true}}).then(function(comments){
			models.Comment.findAll({where: {publicado: true}},{group: 'QuizId'})
			.then(function(with_comments){
				res.render('statistics.ejs',
				{quizes: quizes,
					comments: comments,
					avg: comments/quizes,
					no_comments: quizes-with_comments.length,
					with_comments: with_comments.length,
					errors: []
				});
			});
		});
	});
	
}