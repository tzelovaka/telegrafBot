const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
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

const baseEmpty = new Composer()
baseEmpty.on ('text', async (ctx)=>{
  try {
    ctx.wizard.state.data = {};
    const count = await story.count({where: {
    authId: ctx.message.from.id, 
    release: false,
  }});
  if (count > 0) {
    await ctx.reply ('История уже создаётся!');
    return ctx.scene.leave()
  }
  await ctx.reply ('Введите название истории');
  } catch (e) {
  await ctx.reply ('⚠Ошибка!');
  return ctx.scene.leave()
  }
  return ctx.wizard.next()
})

const storyName = new Composer()
storyName.on ('text', async (ctx)=>{
  try{
  ctx.wizard.state.data.storyName = ctx.message.text;
  await ctx.reply ('Введите описание истории');
  }catch (e) {
    await ctx.reply ('⚠Ошибка!');
    return ctx.scene.leave()
    }
  return ctx.wizard.next()
})

const storyDesc = new Composer()
storyDesc.on ('text', async (ctx)=>{
  try{
  ctx.wizard.state.data.storyDesc = ctx.message.text;
  await ctx.reply ('Введите текст открывающего блока (блок, за которым последует первый выбор).');
}catch (e) {
  await ctx.reply ('⚠Ошибка!');
  return ctx.scene.leave()
  }
  return ctx.wizard.next()
})

const baseSave = new Composer()
baseSave.on ('text', async (ctx)=>{
  ctx.wizard.state.data.baseSave = ctx.message.text;
  const t = await sequelize.transaction();
  try{
  const res = await sequelize.transaction(async (t) => {
    const query = await story.create({
    name: `${ctx.wizard.state.data.storyName}`,
    desc: `${ctx.wizard.state.data.storyDesc}`,
    authId: ctx.message.from.id,
    release: false
  }, { transaction: t });
})
} catch (e) {
  await t.rollback();
  await ctx.reply ('⚠Ошибка!');
  return ctx.scene.leave()
}
await t.commit('commit');
const f = await sequelize.transaction();
try{
    const { count, rows } = await story.findAndCountAll({where: {
      authId: ctx.message.from.id,
      release: false}});
    let c = count - 1;
    const t = await sequelize.transaction();
    const result = await sequelize.transaction(async (f) => {
    const query = await storybl.create({
    linid: 0,
    bl: `${ctx.wizard.state.data.baseSave}`,
    authId: ctx.message.from.id,
    storyId: rows[c].id,
    release: false
  }, { transaction: f });
})
}catch(e){
  await f.rollback();
  await ctx.reply ('⚠Ошибка!');
  return ctx.scene.leave()
}
await f.commit('commit');

  await ctx.reply ('Вы успешно добавили первый блок своей будущей истории.');
  return ctx.scene.leave()
})
const menuCreate = new Scenes.WizardScene('sceneCreate', baseEmpty, storyName, storyDesc, baseSave)
const stage = new Scenes.Stage ([menuCreate])
bot.use(session())
bot.use(stage.middleware())
bot.command ('make', async (ctx) => ctx.scene.enter('sceneCreate'))

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))