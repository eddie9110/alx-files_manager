import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const userData = req.header('Authorization');
    const splitUserData = userData.split(' ')[1];
    const decodedData = Buffer.from(splitUserData, 'base64').toString('utf-8');
    const [email, passWord] = decodedData.split(':');
    if (!email || !passWord) return res.status(401).json({ error: 'Unauthorized' });

    const hashedPassword = sha1(passWord);
    const user = await dbClient.users.findOne({
      email,
      password: hashedPassword,
    });

    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 24 * 3600);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const xTok = req.header('X-Token');
    const key = `auth_${xTok}`;
    const idUser = await redisClient.get(key);
    if (!idUser) return res.status(401).send({ error: 'Unauthorized' });
    await redisClient.del(key);
    return res.status(204).json({});
  }
}

module.exports = AuthController;
