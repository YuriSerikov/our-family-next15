import { hash, compare } from 'bcrypt'
import { v4 } from 'uuid'
import TokenService from './token-service.js'
import UserDtos from '../dtos/dtos.js'
import sendVerificationMail from './sendVerificationMail.js'
import apiError from '../exeptions/api-errors.js'
import UserModel from '../models/user-model.js'
import pkg from 'config'

const { get } = pkg;

class UserService {

  async registration(email: string, password: string) {
    // проверить наличие пользователя в БД
    const candidate: any = await UserModel.findOne({ email })
    if (candidate) {
      const userDtos = new UserDtos(candidate) // id, email, isActivated
      const link = candidate.activationLink

      userDtos.email = 'exists'
      return { user: userDtos, link: link }
    }

    // если такого пользователя нет, можем создать нового
    // шифруем пароль
    const hashPassword = await hash(password, 3)
    const activationLink = v4()

    console.log("email: ", email);
    const user: any = await UserModel.create({
        email,
        password: hashPassword,
        activationLink,
        isActivated: true,
      })
    
    // отправка сообщения для подтверждения регистрации
    //console.log("получатель сообщения: ", user);
    /* const API_URL = get('baseUrl')
    console.log(API_URL)
    const result = await sendVerificationMail(email, `${API_URL}/api/auth/activate/${activationLink}`) */

    const userDtos = new UserDtos(user) // id, email, isActivated
    //if (result.sent) {
      const tokens = TokenService.generateTokens({ ...userDtos })
    await TokenService.saveToken(userDtos.id, tokens.refreshToken)
    
      return { user: userDtos, tokens}  // , message: result.message 
    //} else {
    //  return { user: userDtos, message: result.message }
    //}
  }

  async secondValidation(email: string) {
    const API_URL = get('baseUrl')
    
    const candidate = await UserModel.findOne({ email })
    if (!candidate) {
      return { message: 'ссылка активации отсутствует' }
    } else {
      const link = candidate.activationLink
      const result = await sendVerificationMail(email, `${API_URL}/api/auth/activate/${link}`)
      return { message: result.message }
    }
  }

  async activate(activationLink: string) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) {
      throw apiError.BadRequest('Некорректная ссылка активации')
    }
    user.isActivated = true
    await user.save()
  }

  async login(email: string, password: string) {
    //console.log("login email", email);
    const user: any = await UserModel.findOne({ email })
    if (!user) {
      throw apiError.BadRequest('Пользователь не найден')
    }
    const isPassEquals = await compare(password, user.password)

    if (!isPassEquals) {
      throw apiError.BadRequest('Не верный пароль')
    }
    const userDtos = new UserDtos(user) // id, email, isActivated
    const tokens = TokenService.generateTokens({ ...userDtos })
    //console.log("tokens", tokens);
    await TokenService.saveToken(userDtos.id, tokens.refreshToken)
    return { ...tokens, user: userDtos }
  }

  async logout(refreshToken: string) {
    const token = await TokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken: string) {
    //console.log("запущен user-service refresh token");
    //console.log("refresh token:", refreshToken);
    if (!refreshToken) {
      throw apiError.UnauthorizedError()
    }
    const userData: any = await TokenService.validateRefreshToken(refreshToken)
    //console.log("проверка refresh token", userData);
    const tokenFromDb = await TokenService.findToken(refreshToken)
    //console.log("токен из БД:", tokenFromDb);

    if (!userData || !tokenFromDb) {
      throw apiError.UnauthorizedError()
    }
    const user: any = await UserModel.findById(userData.id)
    //console.log("пользователь из БД : ", user);
    const userDtos = new UserDtos(user) // id, email, isActivated
    const tokens = TokenService.generateTokens({ ...userDtos })
    //console.log("новые токены: ", tokens);
    //console.log("id пользователя: ", userDtos.id);
    await TokenService.saveToken(userDtos.id, tokens.refreshToken)
    return { ...tokens, user: userDtos }
  }
}

export default new UserService()
