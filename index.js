const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const storybl = require('./model')
const sequelize = require('./db');
require ('dotenv').config();
const PORT = process.env.PORT || 5000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN)

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

try {
  sequelize.authenticate()
  //sequelize.sync({ force: true })
  console.log('Соединение с БД было успешно установлено')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД: ', e)
}


bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const baseEmpty = new Composer()
baseEmpty.on ('text', async (ctx)=>{
  ctx.wizard.state.data = {};
  const { count, rows } = await storybl.findAndCountAll();
  console.log(count);
  console.log(rows);
  if (count > 0) {
    ctx.reply('История уже создаётся!')
  return ctx.scene.leave()
  }
  await ctx.reply ('Введите текст открывающего блока.');
  return ctx.wizard.next()
})

const baseSave = new Composer()
baseSave.on ('text', async (ctx)=>{
  ctx.wizard.state.data.baseSave = ctx.message.text;
  const t = await sequelize.transaction();
  try{
    const result = await sequelize.transaction(async (t) => {
    const query = await storybl.create({
    bl: `${ctx.wizard.state.data.baseSave}`
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
}
  await ctx.reply ('Вы успешно добавили первый блок своей будузей истории.');
  return ctx.wizard.next()
})


const menuCreate = new Scenes.WizardScene('sceneCreate', baseEmpty, baseSave)
const stage = new Scenes.Stage ([menuCreate])
bot.use(session())
bot.use(stage.middleware())
bot.command ('read', async (ctx) => ctx.scene.enter('sceneCreate'))

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))