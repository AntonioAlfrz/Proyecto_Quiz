module.exports = {
  up: function(migration, DataTypes, done) {

   migration.createTable(
    'User',
    {
     id: {
       type: DataTypes.INTEGER,
       allowNull: false,
       primaryKey: true,
       autoIncrement: true,
       unique: true
     },
     username: {
      type: DataTypes.STRING,
      unique: true,
      validate: { 
        notEmpty: {msg: "-> Falta username"},
        isUnique: function (value, next) {
          var self = this;
          User.find({where: {username: value}}).then(function (user) {
            if (user && self.id !== user.id) {
              return next('Username ya utilizado');
            }
            return next();
          })
          .catch(function (err) {
            return next(err);
          });
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: { notEmpty: {msg: "-> Falta password"}},
      set: function (password) {
        var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
                    // Evita passwords vacíos
                    if (password === '') {
                      encripted = '';
                    }
                    this.setDataValue('password', encripted);
                  }
                },
                isAdmin: {
                  type: DataTypes.BOOLEAN,
                  defaultValue: false
                },
                createdAt: {
                 type: DataTypes.DATE,
                 allowNull: false
               },
               updatedAt: {
                 type: DataTypes.DATE,
                 allowNull: false
               }
             },
             {
              instanceMethods: {
                verifyPassword: function (password) {
                  var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
                  return encripted === this.password;
                }
              }},
              { sync: {force:true}
            });
done();

},
down: function(migration, DataTypes, done) {

  migration.dropTable('User');
  done();

}
}
