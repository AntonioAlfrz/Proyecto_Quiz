#Descripción

Proyecto realizado para la asignatura de Computación en Red en la ETSIT,UPM.

Se trata de un Quiz con gestión de usuarios, en el que cada uno puede crear sus propias preguntas,
moderar los comentarios en ellas y tener su propia lista de favoritos.

El proyecto está basado Express y nodejs, y para la base de datos se ha usado SQLite.

Está alojado en Heroku: [Quiz](www.quiz-alfrz.herokuapp.com)

#Uso en local

Para sistemas basados en ubuntu:
Instalar [node](https://nodejs.org/)

```
git clone https://github.com/AntonioAlfrz/Proyecto_Quiz
cd Proyecto_Quiz
npm install
```
Instalar heroku toolbet

```wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh```

Ejecutar (http://localhost:5000)

```foreman start```