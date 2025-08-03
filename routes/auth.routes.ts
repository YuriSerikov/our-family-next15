import { Router } from 'express'
import { check } from 'express-validator'
import UserController from '../server/controllers/user-controller.js'

const router = Router()
console.log("работает роутер Авторизации");

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов.').isLength({
      min: 6,
      max: 32,
    }),
  ],
  UserController.registration,
)

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
  ],
  UserController.login,
)

// завершение работы пользователя
router.post('/logout', UserController.logout)

router.get('/activate/:link', UserController.activate)

router.post('/secondValidation', UserController.secondValidation)

export default router
