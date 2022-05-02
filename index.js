const { Telegraf, Markup} = require('telegraf');
require ('dotenv').config();
const { BOT_TOKEN, URL} = process.env
const bot = new Telegraf(BOT_TOKEN)

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

bot.launch()

bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

/*const fs = require('fs');
const path = require('path');
const downloadFile = async (fileUrl, downloadFolder) => {
  const fileName = path.basename("7.jpg");
  const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });

    const w = response.data.pipe(fs.createWriteStream(localFilePath));
    w.on('finish', () => {
      console.log('Successfully downloaded file!');
    });
  } catch (err) { 
    throw new Error(err);
  }
}; 
const IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/BMW_G11_IMG_2002.jpg/1200px-BMW_G11_IMG_2002.jpg';
downloadFile(IMAGE_URL, 'aaa');
*/



/*bot.command ('chrysler', async (ctx) => {
  try{
  await ctx.replyWithHTML('<i>Chrysler</i>', Markup.keyboard(
      [
          [Markup.button.callback('Pacifica', 'btn_7'), Markup.button.callback('Voyager (96-00 гг.)', 'btn_8'), Markup.button.callback('Voyager (01-06 гг.)', 'btn_9')],
          [Markup.button.callback('Neon I', 'btn_10'), Markup.button.callback('Neon II', 'btn_11'), Markup.button.callback('Sebring', 'btn_12')],
          [Markup.button.callback('Stratus', 'btn_13')]
      ]
  ))
  var fs = require("fs");
fs.writeFile("file.txt", "Текст", function(err){
    if (err) {
        console.log(err);
    } else {
        console.log("Файл создан");
    }
});
} catch(e){console.error(e)}
})*/