const { Telegraf, Scenes, Composer, session, Markup, InlineKeyboardButton } = require('telegraf');
const bmw = require('./model')
const sequelize = require('./db');
require ('dotenv').config();
const PORT = process.env.PORT || 5000;
const { BOT_TOKEN, URL} = process.env;
const bot = new Telegraf(BOT_TOKEN)

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

try {
  sequelize.authenticate()
  sequelize.sync({ force: true })
  console.log('Соединение с БД было успешно установлено')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД: ', e)
}


bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const carStart = new Composer()
carStart.on ('text', async (ctx)=>{
  ctx.wizard.state.data = {};
  await ctx.reply ('Введите модель добавляемой BMW')
  return ctx.wizard.next()
})

/*const carMar = new Composer()
carMar.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carMar = ctx.message.text;
  await ctx.reply ('Введите модель добавляемой машины')
  return ctx.wizard.next()
})*/

const carMod = new Composer()
carMod.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carMod = ctx.message.text;
  await ctx.reply ('Вставьте ссылку на картинку добавляемой машины')
  return ctx.wizard.next()
  })

const carPic = new Composer()
carPic.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carPic = ctx.message.text;
  console.log(`${ctx.wizard.state.data.carMod}`)
  console.log(`${ctx.wizard.state.data.carPic}`)
  const t = await sequelize.transaction();
  try{
  const query = await bmw.create({
    model: `${ctx.wizard.state.data.carMod}`,
    pic: `${ctx.wizard.state.data.carPic}`
  }, { transaction: t });
  await t.commit();
} catch (error) {
  await t.rollback();
}
  return ctx.scene.leave()
})

const menuScene = new Scenes.WizardScene('sceneWizard', carStart, /*carMar,*/ carMod, carPic)
const stage = new Scenes.Stage ([menuScene])
bot.use(session())
bot.use(stage.middleware())
bot.command ('add', async (ctx) => ctx.scene.enter('sceneWizard'))

const Rdata = new Composer()
Rdata.on ('text', async (ctx)=>{
  //let i = 1
  const count = await bmw.count();
  console.log(count);
  for (let i=1; i<=count; i++){
  const query = await bmw.findByPk(i).then(async bmw=>{
    if(!bmw) return;
      //await ctx.reply (`${bmw.pic}`);
      //console.log(query);
      //await ctx.replyWithHTML (`<a href="${bmw.pic}">${bmw.model}</a>`);
      await ctx.reply(`${bmw.model}`, {
        reply_markup: {
            inline_keyboard: [
                [ { text: '🔎', url: `${bmw.pic}` }]
            ]
          }
        })
      
  }).catch(err=>console.log(err));
}
  return ctx.scene.leave()
})
const menuRdata = new Scenes.WizardScene('sceneRdata', Rdata)
const stager = new Scenes.Stage ([menuRdata])
bot.use(session())
bot.use(stager.middleware())
bot.command ('read', async (ctx) => ctx.scene.enter('sceneRdata'))
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))