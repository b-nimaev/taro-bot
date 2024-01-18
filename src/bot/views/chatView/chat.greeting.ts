import { ExtraEditMessageText } from "telegraf/typings/telegram-types"
import rlhubContext from "../../models/rlhubContext"
import { IUser, User } from "../../../models/IUser"
import { clear_chats } from "../chat.scene"

export default async function greeting(ctx: rlhubContext, reply?: boolean) {
    try {

        let message: string = `<b>Chat GPT</b>\n\n`
        message += `Статус подписки: <b>Не активен</b>`

        const user = await User.findOne({ id: ctx.from.id })

        message += `\nДоступно токенов: <b>${user.access_tokens}</b> ${user.access_tokens > 0 ? '🔋' : '🪫' }`
        // message += `\n1000 токенов 25 рублей
        
        message += `\n\n<b>Надстройки GPT:</b>\n`
        message += `Модель GPT: <b>${user.gpt_model}</b>\n`
        message += `max_tokens в запросе: <b>${user.max_tokens}</b>\n`
        message += `температура: <b>0.${user.temperature}</b>`

        let extra: ExtraEditMessageText = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Начать диалог', callback_data: 'new_chat' }],
                    [{ text: 'Мои диалоги', callback_data: 'list' }],
                    [{ text: 'Настройки', callback_data: 'settings-chat-gpt' }],
                    [
                        { text: 'Назад', callback_data: 'home' }, { text: 'FAQ', callback_data: 'instruction' },]
                ]
            }
        }

        if (user) {

            await clear_chats(user)

        }

        if (ctx.updateType === 'callback_query') {

            ctx.answerCbQuery()
            reply === true ? await ctx.reply(message, extra) : await ctx.editMessageText(message, extra)

        } else {

            await ctx.reply(message, extra)

        }

        ctx.wizard.selectStep(0)


    } catch (error) {

        console.error(error)

    }
}