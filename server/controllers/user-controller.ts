import { NextFunction, Request, Response } from 'express'
import userService from "../service/user-service.js"
import { Result, ValidationError, validationResult } from 'express-validator'
import pkg from 'config'
const { get } = pkg;
//import cookies from 'cookie-parser'
//const ApiError = require("../exeptions/api-errors");

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors: Result<ValidationError> = validationResult(req)

      if (!errors.isEmpty()) {
        const msgErr = errors.array()
        console.log("Ошибки регистрации:", msgErr[0].msg);
        return res.status(400).json({
          errors: errors.array(),
          message: msgErr[0].msg, //"Некорректные данные при регистрации",
        })
      }

      const { email, password } = req.body
      const userData  = await userService.registration(email, password)
      //console.log("userData = ", userData);

      if (userData.user.email === 'exists') {
        const message = `Пользователь ${email} уже существует!`
        return res.status(400).json({ email: 'exists', message, link: userData.link })
      }

      res.cookie('refresh token', userData.tokens?.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      })
      return res.status(200).json({ email })
       
    } catch (e) {
      console.log('Ошибка регистрации: ', e)
      next(e)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    //console.log('controller Request = ', req.body)
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refresh token', userData.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      })
      return res.json(userData)
    } catch (e) {
      res.status(500).json({ error: 'Ошибка авторизации' })
      next(e)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie(refreshToken)
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    const app_URL: string = get('baseUrl')
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      return res.redirect(app_URL)
    } catch (e) {
      console.log('Ошибка активации: ', e)
      next(e)
    }
  }

  async secondValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      const userData = await userService.secondValidation(email)
      console.log("controller userData:", userData);
      return res.status(200).json({ email })
    } catch (e) {
      console.log('Ошибка активации: ', e)
      next(e)
    }
  }

  
}

export default new UserController()
