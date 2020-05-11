# Spyfall

Web page to play Spyfall. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

## Demo
![](https://i.imgur.com/O2i23my.png)

### Prerequisites

All the listed prerrequisites must be installed in order to use the application.

* [Node js](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/)
* [Mongo DB](https://www.mongodb.com/download-center)
* [React](https://es.reactjs.org/)


### Installing

* Clone repository using git

```bash
git clone https://github.com/jodorganistaca/Spyfall.git
```

* Install dependencies from package.json
```bash
yarn install
```

* Install dependencies from package.json in front (react)
```bash
cd front && npm install
```

### Running the application
* Run the application in back
```bash
yarn start
```
* Run the application in front

```bash
cd front && npm run dev
```

* The application uses Google OAuth 2.0 and Facebook OAuth and therefore is required, inside a file named .env in root directory of the project:

```env
  GOOGLE_CLIENT_ID = <GOOGLE_CLIENT_ID>
  GOOGLE_CLIENT_SECRET = <GOOGLE_CLIENT_SECRET>
  MONGO_URI = <MONGO_URI of the MongoDB Atlas database.>
  FACEBOOK_CLIENT_ID=<FACEBOOK_CLIENT_ID>
  FACEBOOK_CLIENT_SECRET=<FACEBOOK_CLIENT_SECRET>
  


* Also, for personalized collections naming, change default.json in config: 

```json 
    
{
  "dbName": "dbName",
  "usersCollection": "usersCollection",
  "matchesCollection": "matchesCollection",
  "questionsCollection": "questionsCollection",
  "locationsCollection": "locationsCollection"
}
```

## Built With

* [React](https://es.reactjs.org/) - Used for the front
* [Node js](https://nodejs.org/en/) - Used for the back
* [Mongo DB](https://www.mongodb.com/download-center) - Database for user and other collections like movies, series, books, exercise
* [Ant Design](https://ant.design/) - For some component in the UI
* [Material-UI](https://material-ui.com/en/) - For some component in the UI
* [i18n](https://www.npmjs.com/package/i18n) - For locale-based components
* [Next.js](https://nextjs.org/) - For easier mobile integration (PWA)


## Authors

* **José Daniel Organista Calderón** - [github](https://github.com/jodorganistaca)

* **Juan Sebastian Bravo Castelo** - [github](https://github.com/jsbravo-sw)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


