import { Errback, Request, Response } from 'express'
import ApiError from '../exeptions/api-errors.js'

export default function (err: Errback, req: Request, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors })
  }
  return res.status(500).json({ message: 'Не предвиденная ошибка сервера' })
}
