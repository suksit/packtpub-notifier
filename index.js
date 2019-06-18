const cheerio = require('cheerio')
const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request')

const config = require('./config.json')

const BASE_URL = 'https://www.packtpub.com'
const FREE_LEARNING_URL = BASE_URL + '/packt/offers/free-learning'
const NOTIFY_URL = 'https://notify-api.line.me/api/notify'
const IMAGE_NAME = 'cover.jpg'

;(async () => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://chrome:3000'
    })

    const page = await browser.newPage()

    page.on('error', err => {
      console.error(err)
    })

    await page.goto(FREE_LEARNING_URL, {
      waitUntil: 'networkidle0'
    })

    const body = await page.evaluate(() => document.body.innerHTML)
    const $ = cheerio.load(body)

    const title = $('h2.product__title').text().trim()
    const published = $('p.product__publication-date').first().text().trim()
    const imageURL = $('img.product__img').attr('src')

    const image = await page.goto(imageURL)
    fs.writeFileSync(`./${IMAGE_NAME}`, await image.buffer())

    config.tokens.forEach(token => {
      const postData = {
        url: NOTIFY_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token.value}`
        },
        formData: {
          message: `${title}\r\nPublished: ${published}\r\n${FREE_LEARNING_URL}`,
          imageFile: fs.createReadStream(IMAGE_NAME)
        }
      }

      console.log(`sending notification to ${token.name}...`)

      request.post(postData, (err, res) => {
        if (err) {
          console.error(err)
        }

        console.log(res.body)
      })
    })

    await browser.close()
  } catch (err) {
    console.error(err)
  }
})()
