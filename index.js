const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
const storybl = require('./modebl');
const storylin = require('./modelink');
const story = require ('./story');
const like = require ('./like');
const {DataTypes} = require('sequelize');
const sequelize = require('./db');
const { Op } = require("sequelize");
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN);


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




const searchChoiceBtn = new CallbackData('searchChoiceBtn', ['number', 'action']);
const searchBtn = new CallbackData('searchBtn', ['number', 'name', 'action']);
const likeBtn = new CallbackData('likeBtn', ['number', 'action']);

const searchChoiceScene = new Composer()
searchChoiceScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data = {};
  await ctx.reply('Фильтр поиска', Markup.inlineKeyboard(
    [
    [Markup.button.callback('По названию', searchChoiceBtn.create({
    number: '1',
    action: 'filter'}))],
    [Markup.button.callback('По номеру', searchChoiceBtn.create({
      number: '2',
      action: 'filter'}))],
    [Markup.button.callback('Последнее🔥', searchChoiceBtn.create({
      number: '3',
      action: 'filter'}))]
      ])
  );
} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}
return ctx.wizard.next()
})

const searchScene = new Composer()
searchScene.on('callback_query', async (ctx) => {
  try{
  const { number, action } = searchChoiceBtn.parse(ctx.callbackQuery.data);
  if (action != 'filter'){
    await ctx.answerCbQuery('⚠Ошибка!');
    return ctx.scene.leave()
  }
  ctx.wizard.state.data.searchScene = number;
  switch (ctx.wizard.state.data.searchScene) {
    case '1':
  await ctx.reply('Введите название искомой истории');
  return ctx.wizard.next()
  break;
    case '2':
  await ctx.reply('Введите номер искомой истории');
  return ctx.wizard.selectStep(3)
      break;
    case '3':
  const {count, rows} = await story.findAndCountAll({where:{
    release: true
  }})
  let x = count - 1;
  let y = count - 5;
  for (let i = x; i >= y || i>=0; i--){
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].name}</u>
<i>👓 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].name,
      action: 'storyread'}))
        ]
        ])
    ) 
  }
  return ctx.wizard.selectStep(4)
      break;
  }
  return ctx.scene.leave()
} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}
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
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].name}</u>
<i>👓 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].name,
      action: 'storyread'}))
        ]
        ])
    )
  }
} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(4)
})

const numberScene = new Composer()
numberScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data.numberScene = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where:{
    id: ctx.wizard.state.data.numberScene,
    release: true,
  }})
  if (rows === null){
    await ctx.reply('⚠Историй с таким номером нет!');
    return ctx.scene.leave()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++) {
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].name}</u>
<i>👓 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].name,
      action: 'storyread'}))
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
  const { number, name, action } = searchBtn.parse(ctx.callbackQuery.data);
    if (action != 'storyread'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
    await story.increment({ views: 1}, {
      where: {
        id: number
      }}),
  await ctx.answerCbQuery(`Вы выбрали историю "${name}"`);
  ctx.wizard.state.data.readScene = number;
    const row = await story.findOne({where: {
      id: `${ctx.wizard.state.data.readScene}`,
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
        name: row.name,
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
    const { number, name, action } = searchBtn.parse(ctx.callbackQuery.data);
    ctx.wizard.state.data.readSceneTrue = number;
    if (action != 'storyreadtrue'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
  const row = await storybl.findOne({where: {
    linid: ctx.wizard.state.data.readSceneTrue,
    storyId: ctx.wizard.state.data.readScene,
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
    storyId: ctx.wizard.state.data.readScene
  }});
  if (count < 1) {
    const rov = await like.findOne({where:{
        authId: ctx.callbackQuery.from.id,
        story: ctx.wizard.state.data.readScene
    }})
    console.log(rov);
    if (rov === null){
      await ctx.reply('Прохождение одной из сюжетных ветвей окончено, поставьте оценку.', Markup.inlineKeyboard(
        [
        [Markup.button.callback('👍', likeBtn.create({
          number: ctx.wizard.state.data.readScene,
          action: 'storylike'}))],
        [Markup.button.callback('Пропустить', likeBtn.create({
          number: ctx.wizard.state.data.readScene,
          action: 'storylikenull'}))]
        ],
      )
    );
    return ctx.wizard.next()
    }
    await ctx.reply('Прохождение одной из сюжетных ветвей окончено, поставьте оценку.', Markup.inlineKeyboard(
      [
      [Markup.button.callback('👎', likeBtn.create({
        number: ctx.wizard.state.data.readScene,
        action: 'storydislike'}))],
      [Markup.button.callback('Пропустить', likeBtn.create({
        number: ctx.wizard.state.data.readScene,
        action: 'storylikenull'}))]
      ],
    )
  );
    return ctx.wizard.next()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++){
    await ctx.reply(`${rows[i].link}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback(`${rows[i].smile}`, searchBtn.create({
        number: rows[i].id,
        name: null,
        action: 'storyreadtrue'}))]
    ]
    )
  )
  }
} catch(e){
  await ctx.answerCbQuery('⚠Ошибка!');
  await ctx.reply('Вы завершили прохождение истории!');
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(5)
})

const likeScene = new Composer()
likeScene.on('callback_query', async (ctx) => {
  try{
  const { number, action } = likeBtn.parse(ctx.callbackQuery.data);
  ctx.wizard.state.data.likeScene = action;
  switch (ctx.wizard.state.data.likeScene) {
    case 'storylike':
      await ctx.answerCbQuery('👍');
      const t = await sequelize.transaction();
  try{
    const resul = await sequelize.transaction(async (t) => {
      const likeCr = await like.create ({
        authId: ctx.callbackQuery.from.id,
        story: ctx.wizard.state.data.readScene,
      }, { transaction: t })
    })
    await t.commit('commit');
  } catch (error) {
    await ctx.reply ('Ошибка! Пожалуйста попробуйте сначала.');
    await t.rollback();
    return ctx.scene.leave()
  }
    return ctx.scene.leave()
    break;
    case 'storydislike':
      await ctx.answerCbQuery('👎');
      await like.destroy ({where:{
        story: ctx.wizard.state.data.readScene,
        authId: ctx.callbackQuery.from.id
      }})
      return ctx.scene.leave()
    break;
    case 'storylikenull':
      await ctx.answerCbQuery('🔚');
      return ctx.scene.leave()
    break;
  }
  } catch (e){
    await ctx.reply('⚠Ошибка!')
    return ctx.scene.leave()
}
return ctx.wizard.next()
})

const readmenuScene = new Scenes.WizardScene('readScene', searchChoiceScene, searchScene, choiceScene, numberScene, readScene, readSceneTrue, likeScene)
const stager = new Scenes.Stage([readmenuScene])
bot.use(session())
bot.use(stager.middleware())
bot.command('search', async (ctx) => ctx.scene.enter('readScene'))



bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))