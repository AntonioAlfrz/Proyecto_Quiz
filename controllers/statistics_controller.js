var models = require('../models/models.js');

exports.calculate = function(req,res,next){ 
	var with_comments=[];
	var no_comments;
	models.Quiz.count().then(function(quizes){
		models.Comment.findAll({where: {publicado: true}}).then(function(comments){
			no_comments=quizes;
			for (var i=0; i<comments.length; i++){
				if(with_comments[comments[i].QuizId]===undefined){
					no_comments--;
				}
				with_comments[comments[i].QuizId]=1;
			}
			res.render('statistics',
			{quizes: quizes,
				comments: comments.length,
				avg: comments.length/quizes,
				no_comments: no_comments,
				with_comments: quizes-no_comments,
				errors: []
			});
		});
	});
}