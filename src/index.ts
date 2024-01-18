import dotenv from 'dotenv';
import rlhubContext from './bot/models/rlhubContext';
import { Scenes, Telegraf, session } from 'telegraf';
import axios from 'axios';
dotenv.config()
export const bot = new Telegraf<rlhubContext>(process.env.bot!);

import './app'

import home from './bot/views/home.scene';
import { greeting } from './bot/views/home.scene';
import { set_webhook } from './app';
const stage: any = new Scenes.Stage<rlhubContext>([ home ], { default: 'home' });

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => { await ctx.scene.enter('home') })

bot.action(/./, async function (ctx: rlhubContext) {
    ctx.answerCbQuery()
    await greeting(ctx)
})

set_webhook()