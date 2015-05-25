var path = require('path');

/* Al realizar cambios en la BBDD:
heroku pg:reset postgres (Resetear, no hay espacio pg:reset)
heroku run bash -> npm start (ó heroku restart,Inicializar)
*/

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }
  );

// Importar definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

// Importar definición de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Importar definición de la tabla Comment
var user_path =path.join(__dirname,'user');
var User = sequelize.import(user_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

Quiz.belongsTo(User);
User.hasMany(Quiz);

User.belongsToMany(Quiz, {as: 'Favs', through: 'Favourites'});
Quiz.belongsToMany(User, {as: 'Favs', through: 'Favourites'});

exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;

/*
// sequelize.sync() inicializa tabla de preguntas en DB
sequelize.sync().then(function(){
  // then(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function (count){

  	if(count === 0) {   // La tabla se inicializa solo si está vacía
      User.bulkCreate(
        [{username: 'admin', password: '1234', isAdmin: true},
        {username: 'Antonio', password: 'reverse', isAdmin: false}]
        ).then(function(){
          console.log(" BBDD User inicializada");
          Quiz.count().then(function(count){
            if(count===0){
              Quiz.bulkCreate(
              // Preguntas del usuario 2 (Antonio)
              [ {pregunta: 'Capital de Italia',   respuesta: 'Roma', UserId: 2},
              {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2}
              ]
              ).then(function(){console.log('BBDD quiz inicializada')});
            };
          });
        });
      };
  });
});
*/