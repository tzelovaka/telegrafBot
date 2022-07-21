const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
const storybl = require('./modebl')
const storylin = require('./modelink')
const sequelize = require('./db');
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN)

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

try {
  sequelize.authenticate()
  //sequelize.sync({ force: true })
  console.log('Соединение с БД было успешно установлено.')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД ', e)
}

storybl.hasMany(storylin);

bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const baseEmpty = new Composer()
baseEmpty.on ('text', async (ctx)=>{
  ctx.wizard.state.data = {};
  const { count, rows } = await storybl.findAndCountAll();
  console.log(count);
  console.log(rows);
  if (count > 0) {
    await ctx.reply ('История уже создаётся!');
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
  await ctx.reply ('Вы успешно добавили первый блок своей будущей истории.');
  return ctx.scene.leave()
})

const menuCreate = new Scenes.WizardScene('sceneCreate', baseEmpty, baseSave)
const stage = new Scenes.Stage ([menuCreate])
bot.use(session())
bot.use(stage.middleware())
bot.command ('make', async (ctx) => ctx.scene.enter('sceneCreate'))

const callData = new CallbackData('storyblId', ['storyblId']);

const blockEmpty = new Composer()
blockEmpty.on ('text', async (ctx)=>{
ctx.wizard.state.data = {};
  const { count, rows } = await storybl.findAndCountAll();
  console.log(count);
  console.log(rows);
  if (count < 1) {
    await ctx.reply ('Надо создать блок!');
    return ctx.scene.leave()
  }
  await ctx.reply ('Выберите блок из доступных:');

  const co = await storybl.count();
  console.log(co);
  try{
  let x = count - 1;
  for (let i=0; i<=x; i++){
    await ctx.reply(`Блок №${rows[i].id}`)
    await ctx.reply(rows[i].bl/*, Markup.inlineKeyboard(
      [
          [Markup.button.callback('+', callData.create({
            storyblId: rows[i].id,
          }))]
      ]
    )*/)
  }
} catch (e){
  console.log(e);
  await ctx.replyWithHTML('<i>Ошибка!</i>')
}
/*const parsedCallbackData = callData.parse(ctx.callbackQuery.data);
console.log(parsedCallbackData);
function blockChoice (name) {
  bot.action (name, async (ctx) => {
    try {
      await ctx.answerCbQuery()
      console.log('привет');
    } catch (error) {
      console.log(e);
    }
  })
}
blockChoice ('btn')*/
  return ctx.wizard.next()
})

const blockChoice = new Composer()
blockChoice.on ('text', async (ctx)=>{
  ctx.wizard.state.data.blockChoice = ctx.message.text;
  await ctx.reply ('Введите текст ссылки.');
  
  return ctx.wizard.next()
})

const blockLink = new Composer()
blockLink.on ('text', async (ctx)=>{
  ctx.wizard.state.data.blockLink = ctx.message.text;
  const t = await sequelize.transaction();
  try{
    const resul = await sequelize.transaction(async (t) => {
    const quer = await storylin.create({
    link: `${ctx.wizard.state.data.blockLink}`,
    storyblId: `${ctx.wizard.state.data.blockChoice}`
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
}
  await ctx.reply ('Вы успешно добавили ссылку.');
  return ctx.scene.leave()
})

const menuLink = new Scenes.WizardScene('sceneLink', blockEmpty, blockChoice, blockLink)
const stagee = new Scenes.Stage ([menuLink])
bot.use(session())
bot.use(stagee.middleware())
bot.command ('link', async (ctx) => ctx.scene.enter('sceneLink'))

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))