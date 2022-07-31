const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
const storybl = require('./modebl');
const storylin = require('./modelink');
const story = require ('./story');
const {DataTypes} = require('sequelize');
const sequelize = require('./db');
const story = require('./story');
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN)
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

story.hasMany(storybl);
story.hasMany(storylin);

bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const baseEmpty = new Composer()
baseEmpty.on ('text', async (ctx)=>{
  ctx.wizard.state.data = {};
  const { count, rows } = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  console.log(count);
  console.log(rows);
  if (count > 0) {
    await ctx.reply ('История уже создаётся!');
    return ctx.scene.leave()
  }
  await ctx.reply ('Введите название.');
  return ctx.wizard.next()
})

const storyName = new Composer()
storyName.on ('text', async (ctx)=>{
  ctx.wizard.state.data.storyName = ctx.message.text;
  await ctx.reply ('Введите описание истории');
  return ctx.wizard.next()
})

const storyDesc = new Composer()
storyDesc.on ('text', async (ctx)=>{
  ctx.wizard.state.data.storyDesc = ctx.message.text;
  await ctx.reply ('Введите текст открывающего блока (блок, за которым последует первый выбор).');
  const t = await sequelize.transaction();
  try{
    const result = await sequelize.transaction(async (t) => {
    const query = await story.create({
    name: `${ctx.wizard.state.data.storyName}`,
    desc: `${ctx.wizard.state.data.storyDesc}`,
    authId: `${ctx.message.from.id}`
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
}
  return ctx.wizard.next()
})

const baseSave = new Composer()
baseSave.on ('text', async (ctx)=>{
  ctx.wizard.state.data.baseSave = ctx.message.text;
  const t = await sequelize.transaction();
  try{
    const { count, rows } = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
    let c = count - 1;
    const result = await sequelize.transaction(async (t) => {
    const query = await storybl.create({
    linid: 0,
    bl: `${ctx.wizard.state.data.baseSave}`,
    storyId: `${rows[c].id}`,
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
}
  await ctx.reply ('Вы успешно добавили первый блок своей будущей истории.');
  return ctx.scene.leave()
})

const menuCreate = new Scenes.WizardScene('sceneCreate', baseEmpty, storyName, storyDesc, baseSave)
const stage = new Scenes.Stage ([menuCreate])
bot.use(session())
bot.use(stage.middleware())
bot.command ('make', async (ctx) => ctx.scene.enter('sceneCreate'))










const blockEmpty = new Composer()
blockEmpty.on ('text', async (ctx)=>{
ctx.wizard.state.data = {};
  const {coun, row} = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  let n = coun - 1;
  const { count, rows } = await storybl.findAndCountAll({where: {storyId: n}});
  console.log(count);
  console.log(rows);
  if (count < 1) {
    await ctx.reply ('Надо создать блок!');
    return ctx.scene.leave()
  }
  await ctx.reply ('Выберите блок из доступных:');

  try{
  let x = count - 1;
  for (let i=0; i<=x; i++){
    await ctx.reply(`${rows[i].bl}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback('👆', flagBtn.create({
        number: rows[i].id,
        action: 'true'}))]
    ]
    )
  )
    //await ctx.replyWithHTML(`<b>Блок №${rows[i].id}</b>`)
    //await ctx.reply(rows[i].bl)
  }
} catch (e){
  console.log(e);
  await ctx.replyWithHTML('<i>Ошибка!</i>')
}
  return ctx.wizard.next()
})

const blockChoice = new Composer()
blockChoice.on ('callback_query', async (ctx)=>{
  const { number, action } = flagBtn.parse(ctx.callbackQuery.data);
  ctx.wizard.state.data.blockChoice = number;//ctx.message.text;
  await ctx.reply ('Введите текст ссылки.');
  return ctx.wizard.next()
})

const blockLink = new Composer()
blockLink.on ('text', async (ctx)=>{
  ctx.wizard.state.data.blockLink = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  let n = count - 1;
  const t = await sequelize.transaction();
  try{
    const resul = await sequelize.transaction(async (t) => {
    const quer = await storylin.create({
    link: `${ctx.wizard.state.data.blockLink}`,
    storyblId: `${ctx.wizard.state.data.blockChoice}`,
    storyId: n,
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
  await ctx.reply ('Ошибка! Попробуйте сначала.');
  return ctx.scene.leave()
}
  await ctx.reply ('Вы успешно добавили ссылку.');
  return ctx.scene.leave()
})

const menuLink = new Scenes.WizardScene('sceneLink', blockEmpty, blockChoice, blockLink)
const stagee = new Scenes.Stage ([menuLink])
bot.use(session())
bot.use(stagee.middleware())
bot.command ('link', async (ctx) => ctx.scene.enter('sceneLink'))










const linkEmpty = new Composer()
linkEmpty.on ('text', async (ctx)=>{
ctx.wizard.state.data = {};
  const {coun, row} = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  let n = coun - 1;
  console.log(n);
  const { count, rows } = await storylin.findAndCountAll({where: {storyId: n}});
  console.log(count);
  console.log(rows);
  if (count < 1) {
    await ctx.reply ('Надо создать ссылку!');
    return ctx.scene.leave()
  }
  await ctx.reply ('Выберите ссылку из доступных:');
  try{
    let x = count - 1;
    for (let i=0; i<=x; i++){
      await ctx.reply(`${rows[i].link}`, Markup.inlineKeyboard(
        [
        [Markup.button.callback('👆', flagBtn.create({
          number: rows[i].id,
          action: 'true'}))]
      ]
      )
    )
    }
  } catch (e){
    console.log(e);
    await ctx.replyWithHTML('<i>Ошибка!</i>')
  }
  return ctx.wizard.next()
})

const linkChoice = new Composer()
linkChoice.on ('callback_query', async (ctx)=>{
  const { number, action } = flagBtn.parse(ctx.callbackQuery.data);
  ctx.wizard.state.data.linkChoice = number;
  await ctx.reply ('Введите текст блока.');
  return ctx.wizard.next()
})

const linkBlock = new Composer()
linkBlock.on ('text', async (ctx)=>{
  ctx.wizard.state.data.linkBlock = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  let n = count - 1;
  const t = await sequelize.transaction();
  try{
    const resul = await sequelize.transaction(async (t) => {
    const quer = await storybl.create({
    linid: `${ctx.wizard.state.data.linkChoice}`,
    bl: `${ctx.wizard.state.data.linkBlock}`,
    storyId: n,
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
  await ctx.reply ('Ошибка! Попробуйте сначала.');
  return ctx.scene.leave()
}
  await ctx.reply ('Вы успешно добавили блок.');
  return ctx.scene.leave()
})

const menuBlock = new Scenes.WizardScene('sceneBlock', linkEmpty, linkChoice, linkBlock)
const stager = new Scenes.Stage ([menuBlock])
bot.use(session())
bot.use(stager.middleware())
bot.command ('block', async (ctx) => ctx.scene.enter('sceneBlock'))










bot.command ('play', async (ctx) => {
  const { count, rows } = await story.findAndCountAll({where: {authId: `${ctx.message.from.id}`}});
  let c = count - 1;
  if (c<0) {
    endCom();
  }
  await ctx.reply(`${rows[c].name}`)
  await ctx.reply (`${rows[c].desc}`)
  var p = 0; //linid
  btnLoop();
  async function btnLoop() {
  const row = await storybl.findOne({where: {
    linid: p, 
    storyId: c
  }
});
  const {count, rows} = await storylin.findAndCountAll ({where: {storyblId: row.id}});
  console.log(count);
  let x = count - 1;
  
  await ctx.reply(`${row.bl}`);
  for (let i = 0; i <= x; i++){
    await ctx.reply(`${rows[i].link}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback('👆', flagBtn.create({
        number: rows[i].id,
        action: 'true'}))]
    ]
    )
  )
  }
}
bot.action(flagBtn.filter({action: 'true'}), async (ctx)=>{
  const { number, action } = flagBtn.parse(ctx.callbackQuery.data);
  p = number
  btnLoop();
})
  function endCom() {
    ctx.reply('Вы не добавили ни одной истории!')
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))