import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const URL = `mongodb://${HOST}:${PORT}`; // url

class DBClient {
  constructor() {
    MongoClient.connect(URL, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = this.client.db(DATABASE);
      } else {
        console.log(err);
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() { 
    this.users = this.db.collection('users'); // const users = ...
    return this.users.countDocuments();
  }

  async nbFiles() {
    this.files = this.db.collection('files'); // const files = ...
    return this.files.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
