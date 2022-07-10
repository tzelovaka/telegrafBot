const { Telegraf, Scenes, Composer, session, Markup} = require('telegraf');
const car = require('./model')
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
  //sequelize.sync({ force: true })
  console.log('Соединение с БД было успешно установлено')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД: ', e)
}


bot.start ((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец!'}`))

const carStart = new Composer()
carStart.on ('text', async (ctx)=>{
  ctx.wizard.state.data = {};
  let x = 'auto'
  await ctx.replyWithHTML('<b>Выберите марку добавляемого авто</b>', Markup.keyboard(
    [
        [Markup.button.callback('Alfa Romeo', 'btn_1'), Markup.button.callback('Audi', 'btn_2'), Markup.button.callback('BMW', 'btn_3'), Markup.button.callback('Cadillac', 'btn_4')],
        [Markup.button.callback('Chevrolet', 'btn_5'), Markup.button.callback('Chrysler', 'btn_6'), Markup.button.callback('Citroen', 'btn_7'), Markup.button.callback('Daewoo', 'btn_8')],
        [Markup.button.callback('Daihatsu', 'btn_9'), Markup.button.callback('Fiat', 'btn_10'), Markup.button.callback('Ford', 'btn_11'), Markup.button.callback('Honda', 'btn_12')],
        [Markup.button.callback('Hyndai', 'btn_13'), Markup.button.callback('Jeep', 'btn_14'), Markup.button.callback('KIA', 'btn_15'), Markup.button.callback('Lancia', 'btn_16')],
        [Markup.button.callback('Lexus', 'btn_17'), Markup.button.callback('Lincoln', 'btn_18'), Markup.button.callback('Mazda', 'btn_19'), Markup.button.callback('Mercedes', 'btn_20')],
        [Markup.button.callback('Mitsubishi', 'btn_21'), Markup.button.callback('Nissan', 'btn_22'), Markup.button.callback('Opel', 'btn_23'), Markup.button.callback('Peugeot', 'btn_24')],
        [Markup.button.callback('Renault', 'btn_25'), Markup.button.callback('Saab', 'btn_26'), Markup.button.callback('Subaru', 'btn_27'), Markup.button.callback('Suzuki', 'btn_28')],
        [Markup.button.callback('Toyota', 'btn_29'), Markup.button.callback('Volkswagen', 'btn_30')]
      ]))
      /*bot.action('btn_1', async () => {
        try{
          x = 'audi'
        } catch(e) {
          console.log(error);
        }
      })
      bot.action('btn_2', async () => {
        try{
          x = 'bmw'
        } catch(e) {
          console.log(error);
        }
      })*/
  return ctx.wizard.next()
})

const carMar = new Composer()
carMar.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carMar = ctx.message.text;
  await ctx.reply ('Введите модель добавляемого авто')
  return ctx.wizard.next()
})

const carMod = new Composer()
carMod.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carMod = ctx.message.text;
  await ctx.reply ('Вставьте ссылку на картинку добавляемого авто')
  return ctx.wizard.next()
  })

const carPic = new Composer()
carPic.on ('text', async (ctx)=>{
  ctx.wizard.state.data.carPic = ctx.message.text;
  console.log(`${ctx.wizard.state.data.carMod}`)
  console.log(`${ctx.wizard.state.data.carPic}`)
  const t = await sequelize.transaction();
  try{
    const result = await sequelize.transaction(async (t) => {
    const query = await /*ctx.wizard.state.data.carMar*/car.create({
    model: `${ctx.wizard.state.data.carMod}`,
    pic: `${ctx.wizard.state.data.carPic}`
  }, { transaction: t });
})
await t.commit('commit');
} catch (error) {
  await t.rollback();
}
  return ctx.scene.leave()
})

const menuScene = new Scenes.WizardScene('sceneWizard', carStart, carMar, carMod, carPic)
const stage = new Scenes.Stage ([menuScene])
bot.use(session())
bot.use(stage.middleware())
bot.command ('add', async (ctx) => ctx.scene.enter('sceneWizard'))

const Rdata = new Composer()
Rdata.on ('text', async (ctx)=>{
  //let i = 1
  const co = await car.count();
  console.log(co);
  /*const amount = await car.count({
    where: {
      model: "E32"
    }
  });*/
  const { count, rows } = await car.findAndCountAll({
    where: {
      model: "E32"
    }
  });
  console.log(count);
  for (let i=0; i<=count; i++){
  await ctx.reply(rows[i].model);
  }
  /*for (let i=1; i<=count; i++){
  const query = await car.findByPk(i).then(async car=>{
    if(!car) return;
      await ctx.reply(`${car.model}`, {
        reply_markup: {
            inline_keyboard: [
                [ { text: '🔎', url: `${car.pic}` }]
            ]
          }
        })
      
  }).catch(err=>console.log(err));
}*/
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