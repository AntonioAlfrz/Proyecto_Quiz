module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'Quiz', {  id: { type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true },
        pregunta: { type: DataTypes.STRING,
          validate: { notEmpty: {msg: "-> Falta Pregunta"}},
          allowNull: false,
          defaultValue:'Pregunta' },
          respuesta: { type: DataTypes.STRING,
            validate: { notEmpty: {msg: "-> Falta Respuesta"}},
            allowNull: false },
            imagen: {type: DataTypes.STRING},
            createdAt: { type: DataTypes.DATE,
              allowNull: false },
              updatedAt: { type: DataTypes.DATE,
                allowNull: false }
              },
              { sync: {force:true} }
              );
    done();
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Quiz')
    done();  }
  }