import { NextFunction, Request, Response } from 'express'
import apiErrors from '../exeptions/api-errors.js'
import tokenService from '../service/token-service.js'


export default async function (req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization
    console.log("заголовок авторизации: ", authorizationHeader);

    if (!authorizationHeader) {
      //console.log("нет заголовка req.headers.authorization");
      return next(apiErrors.UnauthorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]
    if (!accessToken) {
      //console.log("нет токена accessToken");
      return next(apiErrors.UnauthorizedError())
    }

    const userData = await tokenService.validateAccessToken(accessToken)
    //console.log("userData = ", userData);
    if (!userData) {
      console.log("нет валидации токена доступа");
      return next(apiErrors.UnauthorizedError())
    }
    req.userData = userData
    next()
  } catch (e) {
    console.log("auth-midleware: ошибка не определена - ", e);
    return next(apiErrors.UnauthorizedError())
  }
}
