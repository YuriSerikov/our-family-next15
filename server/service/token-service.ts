
import tokenModel  from '../models/token-model.js'
import jwt from 'jsonwebtoken'
import config from "config";

const JWT_ACCESS_SECRET: string = config.get('JWT_ACCESS_SECRET');
const JWT_REFRESH_SECRET: string = config.get('JWT_REFRESH_SECRET');

class TokenService {
  generateTokens(payload: string | object) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: '10m',
    })
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    })
    return { accessToken, refreshToken }
  }
  
  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await tokenModel.findOne({ user: userId })
    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }
    const tocken = await tokenModel.create({
      user: userId,
      refreshToken: refreshToken,
    })
    return tocken
  }

  async removeToken(refreshToken: string) {
    const tokenData = await tokenModel.deleteOne({
      refreshToken: refreshToken,
    })
    return tokenData
  }

  async validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, JWT_REFRESH_SECRET)
      return userData
    } catch (error) {
      return null
    }
  }

  async validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, JWT_ACCESS_SECRET)
      //console.log("валидация токуна доступа userData: ", userData);
      return userData
    } catch (error) {
      return null
    }
  }
  async findToken(refreshToken: string) {
    const tokenData = await tokenModel.findOne({ refreshToken: refreshToken })
    return tokenData
  }
}

export default new TokenService()
