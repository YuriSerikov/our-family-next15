import { Router } from 'express'
import lodash from 'lodash'
//import fileUpload from 'express-fileupload'
import cors from 'cors'
import { join } from 'path'


const routerPhoto = Router()
//console.log("работает роутер Фотоальбома");

routerPhoto.post('/upload-photos', cors(), async (req, res) => {
  //console.log("работает роутер множественной загрузки фото");
  try {
    const fileFromClient: any = req.files
    //console.log('files from Client: ', fileFromClient)
    if (!fileFromClient) {
      res.send({
        status: false,
        message: 'Загрузка файлов не исполнена',
      })
    } else {
      const data: { name: string; mimetype: string; size: number }[] = []
      //loop all files
      lodash.forEach(lodash.keysIn(fileFromClient.photos), (key) => {
        const photo: any = fileFromClient.photos[key]
        //move photo to uploads directory

        photo.mv('./photos/' + decodeURI(photo.name))
        //push file details
        data.push({
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size,
        })
      })
      //return response
      res.send({
        status: true,
        message: 'Файлы загружены',
        data: data,
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

routerPhoto.post('/upload-avatar', cors(), async (req, res) => {
  //console.log("работает роутер одиночной загрузки фото");
  try {
    const fileFromClient = req.files
    if (!fileFromClient) {
      res.send({
        status: false,
        message: 'Загрузка файла не исполнена. Нет файла для загрузки.ы',
      })
    } else {
      //Use the name of the input field ("avatar") to retrieve the uploaded file
      const picture: any = fileFromClient.avatar
      //Use the mv() method to place the file in upload directory ("photos")
      picture.mv('./photos/' + decodeURI(picture.name))
      //send response
      res.send({
        status: true,
        message: 'Файл загружены',
        data: {
          name: picture.name,
          mimetype: picture.mimetype,
          size: picture.size,
        },
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

routerPhoto.get('/photos:file(*)', cors(), async (req, res) => {
  //console.log("работает роутер выгрузки фото");
  const options: any = {
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  }
  const fileName = req.params.file
  const fileLocation = join('./photos', fileName)

  res.download(fileLocation, options, function (err) {
    if (err) {
      console.log(err || 'Что-то пошло не так (:')
    } else {
      console.log('Sent:', fileName)
    }
  })
})

export default routerPhoto
