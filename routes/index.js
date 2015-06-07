var express = require('express');
var multer = require('multer');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var favouritesController = require('../controllers/favourites_controller');

var statisticsController = require('../controllers/statistics_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Quiz', errors: [] });
});

//Autoload de comandos con :quizId
router.param('quizId',quizController.load);
router.param('commentId', commentController.load);
router.param('userId', userController.load);

// Definición de rutas de sesión
router.get('/login',sessionController.new);
router.post('/login', sessionController.create);
router.get('/logout',sessionController.destroy);

// Autor
router.get('/author',function(req,res,next){
	res.render('author',{errors: []});
});

// Estadísticas
router.get('/statistics',statisticsController.calculate);

// Favoritos
router.get('/user/:userId(\\d+)/favourites',sessionController.loginRequired,userController.ownershipRequired,favouritesController.index);
router.put('/user/:userId(\\d+)/favourites/:quizId(\\d+)', sessionController.loginRequired,userController.ownershipRequired,
											favouritesController.update);
router.delete('/user/:userId(\\d+)/favourites/:quizId(\\d+)',sessionController.loginRequired,userController.ownershipRequired,favouritesController.destroy);

// Definición de rutas de cuenta

//Admin
router.get('/gestion',sessionController.loginRequired,userController.adminView);

//Creación
router.get('/user',userController.new);
router.post('/user',userController.create);
router.get('/user/verify',userController.verify);
router.post('/user/verify',userController.verificado);

//Gestión
router.get('/user/:userId(\\d+)/edit',sessionController.loginRequired,userController.ownershipRequired, userController.edit);
router.put('/user/:userId(\\d+)',  sessionController.loginRequired,userController.ownershipRequired, userController.update);
router.delete('/user/:userId(\\d+)',  sessionController.loginRequired,userController.ownershipRequired, userController.destroy);
router.get('/user/:userId(\\d+)/quizes', sessionController.loginRequired,userController.ownershipRequired, quizController.index);     // ver las preguntas de un usuario
router.get('/resetpass', userController.resetPass);
router.get('/sentpass', userController.sentPass);
router.get('/formpass/:rand', userController.formpass);
router.put('/formpass/:rand', userController.changepass);

// Definición rutas de quizes
router.get('/quizes',quizController.index);
router.get('/quizes/:quizId(\\d+)',quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',quizController.answer);
router.get('/quizes/new', sessionController.loginRequired, quizController.new);
router.post('/quizes/create', sessionController.loginRequired, multer({ dest: './public/media/'}), quizController.create);
router.get('/quizes/:quizId(\\d+)/edit', sessionController.loginRequired,quizController.ownershipRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)', sessionController.loginRequired, quizController.ownershipRequired, multer({ dest: './public/media/'}), quizController.update);
router.delete('/quizes/:quizId(\\d+)', sessionController.loginRequired,quizController.ownershipRequired, quizController.destroy);

router.get('/quizes/:quizId(\\d+)/comments/new',commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',
	sessionController.loginRequired,commentController.ownershipRequired, commentController.publish);

module.exports = router;