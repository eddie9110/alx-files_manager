import sha1 from 'sha1';
import Queue from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

const queuedUser = new Queue('userQ');
const RedisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { password } = req.body;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashedPassword = sha1(password);
    const newUser = await dbClient.users.insertOne({
      email,
      password: hashedPassword,
    });
    const createdUser = {
      id: newUser.insertedId,
      email,
    };
    await queuedUser.add({
      userId: newUser.insertedId.toString(),
    });
    return res.status(201).send(createdUser);
  }

  static async getMe(req, res) {
    const xToken = req.headers['x-token'];
    if (!xToken) return res.status(401).json({ error: 'Unauthorized' });
    const id = await RedisClient.get(`auth_${xToken}`);

    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const users = dbClient.db.collection('users');
    const user = await users.findOne({ _id: ObjectId(id) });
    if (user) {
      return res.status(200).json({ id: user._id, email: user.email });
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
