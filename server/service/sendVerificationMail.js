import nodemailer from 'nodemailer'

const sendVerificationMail = async (to, link) => {
  try {
    const testEmailAccount = await nodemailer.createTestAccount()
    let transporter
    let from

    if (process.env.NODE_ENV === 'development') {
      from = 'smtp.ethereal.email'
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports; false for 587
        auth: {
          user: testEmailAccount.user, // generated ethereal user
          pass: testEmailAccount.pass, // generated ethereal password
        },
      })
    } else {
      from = 'serikovreg.ru@mail.ru'
      transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'serikovreg.ru@mail.ru',
          pass: 'TmuMWvKuyhFCTXD08fmD',
        },
      })
    }

    const mailOptions = {
      from: from, // адрес отправителя
      to: to, // список получателей
      subject: 'Подтверждение регистрации', // тема сообщения
      text: '', // текст в теле сообщения
      html: `
            <div>
                <h1>Для подтверждения регистрации в программе "Семейное дерево" перейдите по ссылке </h1>
                <a href="${link}">${link}</a>
            </div>
            `, // html в теле сообщения
    }

    // отправка сообщения с помощью  указанного объекта transport
    const info = await transporter.sendMail(mailOptions)
    console.log('Отправлено сообщение: %s', info.messageId)
    const message = `Сообщение пользователю ${to} отправлено.`
    return { sent: true, message: message }
  } catch (error) {
    //console.log("Ошибка отправки почты: ", error);
    return { sent: false, message: 'Ошибка отправки почты' }
  }
}
export default sendVerificationMail
