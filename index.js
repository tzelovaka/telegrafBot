const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
const storybl = require('./modebl');
const storylin = require('./modelink');
const story = require ('./story');
const {DataTypes} = require('sequelize');
const sequelize = require('./db');
const { Op } = require("sequelize");
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN);
const flagBtn = new CallbackData('flagBtn', ['number', 'action']);


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

bot.start ((ctx) => ctx.reply(`Здравия желаю, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const playBtn = new CallbackData('playBtn', ['number', 'action']);
const playScene = new Composer()
playScene.on('text', async (ctx) => {
  ctx.wizard.state.data = {};
  try{
    const row = await story.findOne({where: {
      authId: ctx.message.from.id,
      release: true
    }});
    if (row===null){
      await ctx.reply('Вы не добавили ни одной истории!')
      return ctx.scene.leave()
    }
    if (row.pic != null) await ctx.replyWithPhoto({ url: `${row.pic}` }, { caption: `🎫 ${row.name}`});
    else  await ctx.reply(`🎫 ${row.name}`);
    await ctx.reply (`📖 ${row.desc}`)
    await ctx.reply('Начать читать?', Markup.inlineKeyboard(
      [
      [Markup.button.callback('👆', playBtn.create({
        number: 0,
        action: 'play'}))]
    ]))
  } catch (e){
    await ctx.reply('⚠Ошибка!')
    return ctx.scene.leave()
}
return ctx.wizard.next()
})


const playMech = new Composer()
playMech.on('callback_query', async (ctx) => {
  try{
    const { number, action } = playBtn.parse(ctx.callbackQuery.data);
    if (action != 'play'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
  await ctx.answerCbQuery('Выбор сделан');
  ctx.wizard.state.data.playMech = number;
  const ro = await story.findOne({where: {
    authId: ctx.callbackQuery.from.id,
    release: true
  }});
  const row = await storybl.findOne({where: {
    linid: ctx.wizard.state.data.playMech,
    storyId: ro.id,
    authId: ctx.callbackQuery.from.id,
    release: true
  }
});
if (row.pic != null) {
  let res = await ctx.replyWithPhoto({ url: `${row.pic}` }, { caption: `${row.bl}`});
}
else {
  let res = await ctx.reply(`${row.bl}`);
}
  const {count, rows} = await storylin.findAndCountAll ({where: {
    authId: ctx.callbackQuery.from.id,
    release: true,
    storyblId: row.id
  }});
  if (count < 1) {
    await ctx.reply('Вы завершили прохождение истории!');
    return ctx.scene.leave()
  }

  let x = count - 1;
  for (let i = 0; i <= x; i++){
    await ctx.reply(`${rows[i].link}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback(`${rows[i].smile}`, playBtn.create({
        number: rows[i].id,
        action: 'play'}))]
    ]
    )
  )
  }
} catch(e){
  await ctx.answerCbQuery('⚠Ошибка!');
  await ctx.reply('Вы завершили прохождение истории!');
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(1)
})

const playmenuScene = new Scenes.WizardScene('playScene', playScene, playMech)
const staget = new Scenes.Stage([playmenuScene])
bot.use(session())
bot.use(staget.middleware())
bot.command('play', async (ctx) => ctx.scene.enter('playScene'))





const searchBtn = new CallbackData('searchBtn', ['number', 'name', 'action']);
const searchScene = new Composer()
searchScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data = {};
  await ctx.reply('Введите название искомой истории');
} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}
return ctx.wizard.next()
})

const choiceScene = new Composer()
choiceScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data.choiceScene = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where:{
    name: ctx.wizard.state.data.choiceScene,
    release: true,
  }})
  if (rows === null){
    await ctx.reply('⚠Историй с таким названием нет!');
    return ctx.scene.leave()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++) {
    await ctx.reply (`📚 ${rows[i].name}`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: `${rows[i].name}`,
      action: 'storysearch'}))
        ]
        ])
    )
  }
} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}
return ctx.wizard.next()
})

const readScene = new Composer()
readScene.on('callback_query', async (ctx) => {
  try{
  const { number, name, action } = playBtn.parse(ctx.callbackQuery.data);
    if (action != 'storyread'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
  await ctx.answerCbQuery(`Вы выбрали историю "${name}"`);
  ctx.wizard.state.data.choiceScene = number;
    const row = await story.findOne({where: {
      id: ctx.wizard.state.data.choiceScene,
      release: true,
    }});
    if (row===null){
      await ctx.reply('Вы не добавили ни одной истории!')
      return ctx.scene.leave()
    }
    if (row.pic != null) await ctx.replyWithPhoto({ url: `${row.pic}` }, { caption: `🎫 ${row.name}`});
    else  await ctx.reply(`🎫 ${row.name}`);
    await ctx.reply (`📜 ${row.desc}`)
    await ctx.reply('Начать читать?', Markup.inlineKeyboard(
      [
      [Markup.button.callback('👆', searchBtn.create({
        number: 0,
        action: 'storyreadtrue'}))]
    ]))
  } catch (e){
    await ctx.reply('⚠Ошибка!')
    return ctx.scene.leave()
}
return ctx.wizard.next()
})


const readSceneTrue = new Composer()
readSceneTrue.on('callback_query', async (ctx) => {
  try{
    const { number, name, action } = playBtn.parse(ctx.callbackQuery.data);
    ctx.wizard.state.data.readSceneTrue = number;
    if (action != 'storyreadtrue'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
  const row = await storybl.findOne({where: {
    linid: ctx.wizard.state.data.readSceneTrue,
    storyId: ctx.wizard.state.data.choiceScene,
    release: true
  }
});
if (row.pic != null) {
  let res = await ctx.replyWithPhoto({ url: `${row.pic}` }, { caption: `${row.bl}`});
}
else {
  let res = await ctx.reply(`${row.bl}`);
}
  const {count, rows} = await storylin.findAndCountAll ({where: {
    release: true,
    storyblId: row.id,
    storyId: ctx.wizard.state.data.choiceScene
  }});
  if (count < 1) {
    await ctx.reply('Вы завершили прохождение истории!');
    return ctx.scene.leave()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++){
    await ctx.reply(`${rows[i].link}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback(`${rows[i].smile}`, playBtn.create({
        number: rows[i].id,
        action: 'play'}))]
    ]
    )
  )
  }
} catch(e){
  await ctx.answerCbQuery('⚠Ошибка!');
  await ctx.reply('Вы завершили прохождение истории!');
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(3)
})



const readmenuScene = new Scenes.WizardScene('readScene', searchScene, choiceScene, readScene, readSceneTrue)
const stager = new Scenes.Stage([readmenuScene])
bot.use(session())
bot.use(stager.middleware())
bot.command('search', async (ctx) => ctx.scene.enter('readScene'))



bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))