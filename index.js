const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const { CallbackData } = require('telegraf-callback-data');
const storybl = require('./modebl');
const storylin = require('./modelink');
const story = require ('./story');
const like = require ('./like');
const messages = require('./messages')
const sequelize = require('./db');
require ('dotenv').config();
const PORT = process.env.PORT || 3000;
const { BOT_TOKEN} = process.env;
const { A } = process.env;
const { B } = process.env;
const bot = new Telegraf(BOT_TOKEN, {
  polling: true,
  autoStart: true,
  interval: 300,
  params:{
    timeout: 10
  }
});
const user = require ('./user');
const safety = require ('./safety');

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

try {
  sequelize.authenticate()
  sequelize.sync({})
  console.log('Соединение с БД было успешно установлено.')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД ', e)
}
story.hasMany(storybl);
story.hasMany(storylin);
bot.on('text', async (ctx, next) => {
  try{
  await messages.create({authId: `${ctx.message.chat.id}`, message_id: `${ctx.message.message_id}`})
  let msgs = await messages.findAll({where:{authId: `${ctx.message.chat.id}`}})
  if (msgs){
    msgs.forEach(async msg => {
    try {
      await ctx.deleteMessage(msg.message_id);
    } catch(e){
      console.log(e);
    }
    
  });
  await messages.destroy({where: {authId: `${ctx.message.chat.id}`}})
}
  let u = await user.findOne({where:{authId: `${ctx.message.from.id}`}})
  if (!u) await ctx.replyWithHTML(
`Добро пожаловать в <b>Сторинтер</b>! Данная система разработана для <b>создания</b> и <b>чтения интерактивных историй</b> (в них сюжет зависит от <b>выбора/выборов</b> читателя в процессе чтения). Если вы хотите попробовать прочитать историю: 
◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤
<i>/start -> "Популярное"</i>
◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤
если создать:
◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤
<i><b>"Редактор"</b> (большая голубая кнопка слева снизу): для создания <b>именно сюжета</b> выйдите из главного меню путём нажатия красной кнопки справа сверху.</i>
◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤◢◣◤
/start – главное меню
/myprofile – личный кабинет`
)
  await safety(ctx.message.from.id, ctx.message.date, ctx.message.from.is_bot);
  const row = await user.findOne({where:{
    authId: ctx.message.from.id
  }})
  if (row.ban == true){
    await ctx.reply ('Вы забанены!')
  }
  else{
    await next()
  }
  }catch(e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`}) 
  }
 
})
bot.on('callback_query', async (ctx, next) => {
  try{
  let msgs = await messages.findAll({where:{authId: `${ctx.callbackQuery.message.chat.id}`}})
  if (msgs){
    msgs.forEach(async msg => {
      try {
        await ctx.deleteMessage(msg.message_id);
      } catch(e){
        console.log(e);
      }
  });
  await messages.destroy({where: {authId: `${ctx.callbackQuery.message.chat.id}`}})
  }
  
  await safety(ctx.callbackQuery.from.id, ctx.callbackQuery.date, ctx.callbackQuery.from.is_bot);
  const row = await user.findOne({where:{
    authId: ctx.callbackQuery.from.id
  }})
  if (row.ban == true){
    await ctx.reply ('Вы забанены!')
  }
  else{
    await next()
  }
  }catch(e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  }
  
})

const searchChoiceBtn = new CallbackData('searchChoiceBtn', ['number', 'action']);
const searchBtn = new CallbackData('searchBtn', ['number', 'name', 'action']);
const likeBtn = new CallbackData('likeBtn', ['number', 'action']);

const searchChoiceScene = new Composer()
//0
searchChoiceScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data = {};
  let x = await ctx.reply('Фильтр поиска', Markup.inlineKeyboard(
    [
    [Markup.button.callback('По названию', searchChoiceBtn.create({
    number: '1',
    action: 'filter'}))],
    [Markup.button.callback('По номеру', searchChoiceBtn.create({
      number: '2',
      action: 'filter'}))],
    [Markup.button.callback('Актуальное🔴', searchChoiceBtn.create({
      number: '3',
      action: 'filter'}))],
    [Markup.button.callback('ТОП-5 популярных👀', searchChoiceBtn.create({
      number: '4',
      action: 'filter'}))],
    ])
  );
  let y = await ctx.replyWithHTML('⬇⬇⬇<b>РЕДАКТОР</b> для креатива');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  await messages.create({authId: `${y.chat.id}`, message_id: `${y.message_id}`})
} catch(e){
  let x = await ctx.reply('⚠Ошибка!');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  return ctx.scene.leave()
}
return ctx.wizard.next()
})
//1
const searchScene = new Composer()
searchScene.on('callback_query', async (ctx) => {
 // try{
    /*let led = await ctx.reply('⏳ ');
    let x = led.message_id - 2;
    for (let i=led.message_id; i >= x; i--){
    let del = await ctx.telegram.deleteMessage(ctx.chat.id, i);
    }*/
  const { number, action } = searchChoiceBtn.parse(ctx.callbackQuery.data);
  if (action != 'filter'){
    await ctx.answerCbQuery('⚠Ошибка!');
    return ctx.scene.leave()
  }
  ctx.wizard.state.data.searchScene = ctx.callbackQuery.message.date;
  switch (number) {
    case '1':
  let msg = await ctx.reply('Введите название искомой истории');
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  return ctx.wizard.next()
  break;
    case '2':
  let ms = await ctx.reply('Введите номер искомой истории');
  await messages.create({authId: `${ms.chat.id}`, message_id: `${ms.message_id}`})
  return ctx.wizard.selectStep(3)
      break;
    case '3':
  const {count, rows} = await story.findAndCountAll({where:{
    release: true,
    spam: false,
    verification: true
  }})
  let x = count - 1;
  let y = count - 5;
  for (let i = x; i >= y && i>=0; i--){
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    let msg = await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].title}</u>
<i>👀 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].title,
      action: 'storyreadlast'}))
        ]
        ])
    )
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
  return ctx.wizard.selectStep(4)
      break;
      case '4':
        try{
  const {count, rows} = await story.findAndCountAll({
    where:{
      release: true,
      spam: false,
      verification: true
    },
    order: [
      ['views', 'DESC']
    ]
  })/*.then((story) => {
    console.log("Story:", JSON.stringify(story, null, 2));
  });*/
  let x = count - 1
  let msg;
  for (let u = 0; u <= 4 && u<=x; u++){
    const cou = await like.count({where:{
      story: rows[u].id
    }})
    msg = await ctx.replyWithHTML (`<u>№${rows[u].id} 📚 ${rows[u].title}</u>
<i>👀 ${rows[u].views}, ⭐ +${cou}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[u].id,
      name: rows[u].title,
      action: 'storyreadpopular'}))
        ]
        ])
    ) 
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
  
  return ctx.wizard.selectStep(4)
} catch(e){
  let x = await ctx.reply('⚠Ошибка!');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  return ctx.scene.leave()
}
      break;
  }
  return ctx.scene.leave()
/*} catch(e){
  await ctx.reply('⚠Ошибка!');
  return ctx.scene.leave()
}*/
})
//2
const choiceScene = new Composer()
choiceScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data.choiceScene = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where:{
    title: ctx.wizard.state.data.choiceScene,
    release: true,
    verification: true
  }})
  if (count < 1){
    let msg = await ctx.reply('⚠Историй с таким названием нет!');
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    return ctx.scene.leave()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++) {
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    let msg = await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].title}</u>
<i>👀 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].title,
      action: 'storyreadname'}))
        ]
        ])
    )
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
} catch(e){
  let x = await ctx.reply('⚠Ошибка!');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(4)
})
//3
const numberScene = new Composer()
numberScene.on('text', async (ctx) => {
  try{
  ctx.wizard.state.data.numberScene = ctx.message.text;
  const {count, rows} = await story.findAndCountAll({where:{
    id: ctx.wizard.state.data.numberScene,
    release: true,
    verification: true
  }})
  if (count < 1){
    let msg = await ctx.reply('⚠Историй с таким номером нет!');
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    return ctx.scene.leave()
  }
  let x = count - 1;
  for (let i = 0; i <= x; i++) {
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    let msg = await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].title}</u>
<i>👀 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('👆', searchBtn.create({
      number: rows[i].id,
      name: rows[i].title,
      action: 'storyreadnumber'}))
        ]
        ])
    )
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
} catch(e){
  let x = await ctx.reply('⚠Ошибка!');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  return ctx.scene.leave()
}
return ctx.wizard.next()
})
//4
const readScene = new Composer()
readScene.on('callback_query', async (ctx) => {
  try{
  const { number, name, action } = searchBtn.parse(ctx.callbackQuery.data);
    if (action != 'storyreadname' && action != 'storyreadnumber' && action != 'storyreadlast' && action != 'storyreadpopular'){
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
    await story.increment({ views: 1}, {
      where: {
        id: number
      }});
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
    try{
      let msg = await ctx.replyWithPhoto({ url: `${row.img}` }, { caption: `🎫 ${row.title}`});
      await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    }catch(e){
      let msg = await ctx.reply(`🎫 ${row.title}`);
      await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    }
    let x = await ctx.reply (`📜 ${row.desc}`)
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    let y = await ctx.reply('Начать читать?', Markup.inlineKeyboard(
      [
      [Markup.button.callback('👆', searchBtn.create({
        number: '0',
        name: ctx.wizard.state.data.searchScene,
        action: `storyreadtrue${ctx.wizard.state.data.readScene}`}))]
    ]))
    await messages.create({authId: `${y.chat.id}`, message_id: `${y.message_id}`})
  } catch (e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    return ctx.scene.leave()
}
return ctx.wizard.next()
})

//5
const readSceneTrue = new Composer()
readSceneTrue.on('callback_query', async (ctx) => {
  try{
    await ctx.answerCbQuery();
    const { number, name, action } = searchBtn.parse(ctx.callbackQuery.data);
    ctx.wizard.state.data.readSceneTrue = number;
    if (action != `storyreadtrue${ctx.wizard.state.data.readScene}`){
      let x = await ctx.reply('⚠Ошибка!');
      await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
      return ctx.scene.leave()
    }
    if (name != ctx.wizard.state.data.searchScene) {
      let x = await ctx.reply('⚠Ошибка!');
      await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
      return ctx.scene.leave()
    }
    var rov = null;
      if (ctx.wizard.state.data.readSceneTrue !== '0') {
        rov = await storylin.findOne({where:{
      target: ctx.wizard.state.data.readSceneTrue,
      storyId: ctx.wizard.state.data.readScene,
      release: true
    }})}
    if (rov){
      /*const count = await storylin.count({where:{
        storyblId: r.storyblId,
        storyId: ctx.wizard.state.data.readScene
      }})*/
      let msg = await ctx.reply (`${(rov.smile != null && rov.smile != undefined && rov.smile.length > 0) ? rov.smile : '👆'} ${rov.text}`)
      await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    }
    var row = null
  if (ctx.wizard.state.data.readSceneTrue == '0'){
    row = await storybl.findOne({where: {
    fId: '0',
    storyId: ctx.wizard.state.data.readScene,
    release: true
  }
});
  }else{
    row = await storybl.findOne({where: {
      fId: rov.target,
      storyId: ctx.wizard.state.data.readScene,
      release: true
    }
  })
}
  
try {
  let msg = await ctx.replyWithPhoto({ url: `${row.img}` }, { caption: `${row.text}`});
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
}
catch(e) {
  let msg = await ctx.reply(`${row.text}`);
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
}
  const {count, rows} = await storylin.findAndCountAll ({where: {
    release: true,
    source: row.fId,
    storyId: ctx.wizard.state.data.readScene
  }});
  if (count < 1) {
    const rov = await like.findOne({where:{
        authId: ctx.callbackQuery.from.id,
        story: ctx.wizard.state.data.readScene
    }})
    console.log(rov);
    if (rov === null){
      let msg = await ctx.reply('Прохождение одной из сюжетных ветвей окончено, поставьте оценку.', Markup.inlineKeyboard(
        [
        [Markup.button.callback('👍', likeBtn.create({
          number: ctx.wizard.state.data.readScene,
          action: `storylike${ctx.wizard.state.data.readScene}`}))],
        [Markup.button.callback('Пропустить', likeBtn.create({
          number: ctx.wizard.state.data.readScene,
          action: `storylikenull${ctx.wizard.state.data.readScene}`}))]
        ],
      )
    );
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    return ctx.wizard.next()
    }
    let msg = await ctx.reply('Прохождение одной из сюжетных ветвей окончено, поставьте оценку.', Markup.inlineKeyboard(
      [
      [Markup.button.callback('👎', likeBtn.create({
        number: ctx.wizard.state.data.readScene,
        action: `storydislike${ctx.wizard.state.data.readScene}`}))],
      [Markup.button.callback('Пропустить', likeBtn.create({
        number: ctx.wizard.state.data.readScene,
        action: `storylikenull${ctx.wizard.state.data.readScene}`}))]
      ],
    )
  );
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    return ctx.wizard.next()
  }
  let x = count - 1;
  let msg;
  for (let i = 0; i <= x; i++){
    msg = await ctx.reply(`${rows[i].text}`, Markup.inlineKeyboard(
      [
      [Markup.button.callback(`${(rows[i].smile != null && rows[i].smile != undefined && rows[i].smile.length > 0) ? rows[i].smile : '👆'}`, searchBtn.create({
        number: rows[i].target,
        name: ctx.wizard.state.data.searchScene,//ctx.wizard.state.data.searchScene,
        action: `storyreadtrue${ctx.wizard.state.data.readScene}`}))]
    ]
    )
  )
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
} catch(e){
  await ctx.answerCbQuery('⚠Ошибка!');
  let y = await ctx.reply('Вы завершили прохождение истории!');
  await messages.create({authId: `${y.chat.id}`, message_id: `${y.message_id}`})
  return ctx.scene.leave()
}
return ctx.wizard.selectStep(5)
})
//6
const likeScene = new Composer()
likeScene.on('callback_query', async (ctx) => {
  try{
  let msg = await ctx.replyWithHTML (`🔚Прохождение истории окончено:
  /start - главное меню
  /myprofile - мой профиль`)
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  const { number, action } = likeBtn.parse(ctx.callbackQuery.data);
  ctx.wizard.state.data.likeScene = action;
  switch (ctx.wizard.state.data.likeScene) {
    case `storylike${ctx.wizard.state.data.readScene}`:
      const t = await sequelize.transaction();
  try{
    const row = await like.findOne({
      where:{
        authId: ctx.callbackQuery.from.id,
        story: ctx.wizard.state.data.readScene,
      }
    })
    if (row === null) {
    await ctx.answerCbQuery('👍');
    const resul = await sequelize.transaction(async (t) => {
      const likeCr = await like.create ({
        authId: ctx.callbackQuery.from.id,
        story: ctx.wizard.state.data.readScene,
      }, { transaction: t })
    })
    await t.commit('commit');
  }
  else{
    await ctx.answerCbQuery('⚠Ошибка!');
    return ctx.scene.leave()
  }
  } catch (error) {
    let x = await ctx.reply ('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    await t.rollback();
    return ctx.scene.leave()
  }
    return ctx.scene.leave()
    break;


    case `storydislike${ctx.wizard.state.data.readScene}`:
    const ro = await like.findOne({where:{
      story: ctx.wizard.state.data.readScene,
      authId: ctx.callbackQuery.from.id
    }})
    if (ro != null){
      await ctx.answerCbQuery('👎');
      await like.destroy ({where:{
        story: ctx.wizard.state.data.readScene,
        authId: ctx.callbackQuery.from.id
      }})
      return ctx.scene.leave()
    }
    else{
      await ctx.answerCbQuery('⚠Ошибка!');
      return ctx.scene.leave()
    }
    break;

    case `storylikenull${ctx.wizard.state.data.readScene}`:
      await ctx.answerCbQuery('🔚');
      return ctx.scene.leave()
    break;
    default:
      let x = await ctx.reply('⚠Ошибка!')
      await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
      return ctx.scene.leave()
  }
  } catch (e){
    let x = await ctx.reply('⚠Ошибка!')
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    return ctx.scene.leave()
}
return ctx.scene.leave()
})

const readmenuScene = new Scenes.WizardScene('readScene', searchChoiceScene, searchScene, choiceScene, numberScene, readScene, readSceneTrue, likeScene)
const stager = new Scenes.Stage([readmenuScene])
bot.use(session())
bot.use(stager.middleware())
bot.command('start', async (ctx) => ctx.scene.enter('readScene'))


const profileBtn = new CallbackData('profileBtn', ['number', 'action']);

const profileScene = new Scenes.BaseScene('profile')
profileScene.enter(async (ctx) => {
  try{
  ctx.session.myData = {};
  let msg = await ctx.reply(`Имя: ${ctx.message.from.first_name}`, Markup.inlineKeyboard(
    [
    [Markup.button.callback('Мои истории📚', 'mystory')], 
    [Markup.button.callback('Любимые истории💜', 'likedstory')],
  ]))
  await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
}
catch(e){
  let x = await ctx.reply('⚠Ошибка!');
  await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
  return ctx.scene.leave();
}
});

profileScene.action('mystory', async (ctx) => {
  try{
  ctx.session.myData.preferenceType = 'story';
  const {count, rows} = await story.findAndCountAll({where:{
    authId: ctx.callbackQuery.from.id,
    release: true,
  }})
  if (count < 1) {
    await ctx.answerCbQuery('⚠Для этой функции требуется опубликовать историю!');
    return ctx.scene.leave();
  }
  let x = count - 1;
  let msg;
  for (let i = 0; i <= x; i++) {
    const coun = await like.count({where:{
      story: rows[i].id
    }})
    msg = await ctx.replyWithHTML (`<u>№${rows[i].id} 📚 ${rows[i].title}</u>
<i>👀 ${rows[i].views}, ⭐ +${coun}</i>`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('❌Удалить историю', profileBtn.create({
      number: rows[i].id,
      action: 'deletestory'}))
        ]
        ])
    )
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  }
}catch(e){
  await ctx.answerCbQuery('⚠Ошибка!');
  return ctx.scene.leave();
}
});


profileScene.action(profileBtn.filter({action: 'deletestory'}), async (ctx) => {
  try{
  const { number, action } = profileBtn.parse(ctx.callbackQuery.data);
  console.log(number);
  const count = await story.count({where:{
    authId: ctx.callbackQuery.from.id,
    release: true,
  }})
  const row = await story.findOne({where:{
    id: `${number}`,
    release: true
  }})
  await story.destroy({
    where:{
      id: `${number}`,
      release: true
      }
    })
  await storybl.destroy({
    where:{
      authId: `${ctx.callbackQuery.from.id}`,
      storyId: null,
      release: true
      }
      })
  await storylin.destroy({
    where:{
      authId: `${ctx.callbackQuery.from.id}`,
      storyId: null,
      release: true
      }
      })
  await like.destroy({
    where:{
      story: `${number}`
    }
  })
  ctx.session.myData.preferenceType = number;
    let msg = await ctx.reply(`История "${row.title}" была удалена.`);
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    }catch(e){
    await ctx.answerCbQuery('⚠Ошибка!')
    return ctx.scene.leave();
  }
    return ctx.scene.leave();
  })


profileScene.action('likedstory', async (ctx) => {
  try{
  ctx.session.myData.preferenceType = 'likedstory';
  const {count, rows} = await like.findAndCountAll({where:{
    authId: ctx.callbackQuery.from.id,
  }})
    if (count<1) {
      await ctx.answerCbQuery('⚠Для этой функции требуется лайкнуть историю!');
      return ctx.scene.leave();
    }
    let msg = await ctx.reply ('Любимые истории:');
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
      let x = count - 1;
      let y;
      for (let i=0; i<=x; i++){
        const row = await story.findOne({where: {
          id: rows[i].story,
          release: true
        }});
        const coun = await like.count({where:{
          story: row.id
        }})
        y = await ctx.replyWithHTML (`<u>№${row.id} 📚 ${row.title}</u>
<i>👀 ${row.views}, ⭐ +${coun}</i>`)
await messages.create({authId: `${y.chat.id}`, message_id: `${y.message_id}`})
      }
      return ctx.scene.leave();
    } catch (e){
      await ctx.answerCbQuery('⚠Ошибка!')
      return ctx.scene.leave();
    }
});

profileScene.use(async (ctx) =>{ 
return ctx.scene.leave()});

const stagep = new Scenes.Stage([profileScene])
bot.use(session())
bot.use(stagep.middleware())
bot.command('myprofile', (ctx) => ctx.scene.enter('profile'))

//const adminBtn = new CallbackData('adminBtn', ['number', 'action']);
  //0
  const adminChoiceScene = new Composer()
  adminChoiceScene.on('text', async (ctx) => {
    try{
    ctx.wizard.state.data = {};
    await ctx.reply('Меню', Markup.inlineKeyboard(
      [
      [Markup.button.callback('СПАМ', likeBtn.create({
        number: '1',
        action: 'spam'}))],
      [Markup.button.callback('ВЕРИФИКАЦИЯ', likeBtn.create({
        number: '2',
        action: 'verification'}))]
      ],
    )
  );
  } catch(e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    return ctx.scene.leave()
  }
  return ctx.wizard.next()
  })
  //1
  const adminSwitchScene = new Composer()
  adminSwitchScene.on('callback_query', async (ctx) => {
try{
  const { number, action } = likeBtn.parse(ctx.callbackQuery.data);
  ctx.wizard.state.data.adminSwitchScene = number
  switch (ctx.wizard.state.data.adminSwitchScene) {
    case '1':
      await ctx.reply('Введите номер истории для добавления/удаления в/из спам/спама:')
      return ctx.wizard.next()
      break;
    case '2':
      await ctx.reply('Введите номер истории для смены статуса верификации:')
      return ctx.wizard.selectStep(3)
      break;
    default:
      return ctx.scene.leave()
      break;
  }
  } catch(e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    return ctx.scene.leave()
  }
  })
  //2
  const spamScene = new Composer()
  spamScene.on('text', async (ctx) => {
    try{
    ctx.wizard.state.data.spamScene = ctx.message.text;
    let st = await story.findOne({where:{id: BigInt(ctx.wizard.state.data.spamScene)}})
    st.spam = !st.spam
    await st.save()
    let msg = await ctx.reply('Типа кинули в спам (или наоброт)')
    await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
  } catch(e){
    let x = await ctx.reply('⚠Ошибка!');
    await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
    return ctx.scene.leave()
  }
  return ctx.scene.leave()
  })
  //3
  const verificationScene = new Composer()
  verificationScene.on('text', async (ctx) => {
    try{
      ctx.wizard.state.data.verificationScene = ctx.message.text;
      let st = await story.findOne({where:{id: BigInt(ctx.wizard.state.data.verificationScene)}})
    st.verification = !st.verification
    await st.save()
      let msg = await ctx.reply('Типа сняли верификацию (или наоборот).')
      await messages.create({authId: `${msg.chat.id}`, message_id: `${msg.message_id}`})
    } catch (e){
      let x = await ctx.reply('⚠Ошибка!');
      await messages.create({authId: `${x.chat.id}`, message_id: `${x.message_id}`})
      return ctx.scene.leave()
  }
  return ctx.scene.leave()
  })
  
  const adminMenuScene = new Scenes.WizardScene('adminScene', adminChoiceScene, adminSwitchScene, spamScene, verificationScene)
  const stagea = new Scenes.Stage([adminMenuScene])
  bot.use(session())
  bot.use(stagea.middleware())
bot.on('text', (ctx) => {if (ctx.message.from.id === Number(A) && ctx.message.text === B) ctx.scene.enter('adminScene')})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))