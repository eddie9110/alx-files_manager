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
    const users = this.db.collection('users');
    return users.countDocuments();
  }

  async nbFiles() {
    const files = this.db.collection('files');
    return this.files.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
