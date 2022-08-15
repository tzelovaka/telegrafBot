/*const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('@bot-base/callback-data');
const storybl = require('./modebl');
const storylin = require('./modelink');
const story = require ('./story');
const storybuild = require ('./storybuild');
const {DataTypes} = require('sequelize');
const sequelize = require('./db');
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const bot = new Telegraf(BOT_TOKEN)
const flagBtn = new CallbackData('flagBtn', ['number', 'action']);

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}
function makeStory() {
const baseEmpty = new Composer()
baseEmpty.on ('text', async (ctx)=>{
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
  const t = await sequelize.transaction();
  try{
    const result = await sequelize.transaction(async (t) => {
    const query = await story.create({
    name: `${ctx.wizard.state.data.storyName}`,
    desc: `${ctx.wizard.state.data.storyDesc}`,
    authId: ctx.message.from.id,
    release: false
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
  await ctx.replyWithHTML ('<i>Ошибка!</i>⚠');
  return ctx.scene.leave()
}
  await ctx.reply ('Введите текст открывающего блока (блок, за которым последует первый выбор).');
  return ctx.wizard.next()
})

const baseSave = new Composer()
baseSave.on ('text', async (ctx)=>{
  ctx.wizard.state.data.baseSave = ctx.message.text;
  const t = await sequelize.transaction();
  try{
    const { count, rows } = await story.findAndCountAll({where: {
      authId: ctx.message.from.id,
      release: false}});
    let c = count - 1;
    const result = await sequelize.transaction(async (t) => {
    const query = await storybl.create({
    linid: 0,
    bl: `${ctx.wizard.state.data.baseSave}`,
    authId: ctx.message.from.id,
    storyId: rows[c].id,
    release: false
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
  await ctx.replyWithHTML ('<i>Ошибка!</i>⚠');
  return ctx.scene.leave()
}
  await ctx.reply ('Вы успешно добавили первый блок своей будущей истории.');
  return ctx.scene.leave()
})
}

module.exports = makeStory*/