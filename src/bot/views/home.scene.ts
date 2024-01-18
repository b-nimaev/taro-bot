import { Composer, Scenes } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { ISentence, Sentence } from "../../models/ISentence";
import { IUser, User } from "../../models/IUser";
import rlhubContext from "../models/rlhubContext";
import axios, { AxiosResponse } from 'axios';

interface ApiResponse {
    // Определите тип данных, ожидаемых от вашего API
    // Например, если API возвращает объект с полем "data", вы можете указать это здесь
    data: any; // Замените any на реальный тип данных
    user: any
}

const handler = new Composer<rlhubContext>();
const home = new Scenes.WizardScene("home", handler,
    async (ctx: rlhubContext) => await actionHandler(ctx));

const apiEndpoint = process.env.api_url

async function actionHandler(ctx: rlhubContext) {
    try {

        if (ctx.updateType === 'message') {
            
            const user = await getMe(ctx)

            if (!user) {
                return await greeting(ctx)
            }

            if (user.freeSpin === 0) {
                
                let data = await getData();
                if (!data) {
                    return false
                }

                const extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            // [{ text: 'Расклад таро', callback_data: 'taro-action' }],
                            [{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }],
                        ]
                    }
                }
                return ctx.reply(`У вас закончились бесплатные вопросы`, extra)
            }

            const response = await axios.post(
                `${apiEndpoint}/telegram/question`,
                {
                    question: ctx.update.message.text,
                    telegramChatId: ctx.from.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${ctx.scene.session.token}`,
                    },
                }
            );
            
            let message = response.data.answer
            message += `\n\nОсталось вопросов ${user.freeSpin - 1}/3`

            ctx.reply(`${message}`)
        }

        if (ctx.updateType === 'callback_query') {

            const data: 'taro-action' = ctx.update.callback_query.data

            console.log(data)

            ctx.answerCbQuery()

        }

    } catch (error) {
        console.log(error.response.data.message)
    }
}

async function auth() {

    try {
        const credentials = {
            email: 'alexandrbnimaev@gmail.com',
            password: 'adminadmin',
        };

        const token: string = await axios.post(`${apiEndpoint}/auth/login`, credentials)
            .then(response => {

                const token: string = response.data.token; // Полученный JWT-токен
                return token
                // Теперь у вас есть токен, который можно использовать для запросов к защищенным ресурсам API
            })
            .catch(error => {
                console.error('Ошибка аутентификации:', error.response.data.message);
                return error.response.data.message
            });
            
        return token
    } catch (error) {
        // console.log(error)
        return error
    }
        
}

async function getData(): Promise<{ greeting: string, action: string, price: number } | false> {
    try {
        const token: string | null = await auth();
        if (!token) {
            return false;
        }

        const response: AxiosResponse<ApiResponse> = await axios.get(`${apiEndpoint}/bin`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data[0]; // Верните конкретное поле данных, если необходимо

    } catch (error) {
        return false;
    }
}

async function getMe(ctx: rlhubContext): Promise<{ freeSpin: number } | false> {
    try {
        const token: string | null = await auth();

        if (!token) {
            return false;
        }

        ctx.scene.session.token = token

        const response: AxiosResponse<ApiResponse> = await axios.get(`${apiEndpoint}/telegram/${ctx.from.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.user // Верните конкретное поле данных, если необходимо

    } catch (error) {
        return false;
    }
}

const greeting = async function (ctx: rlhubContext) {
    
    try {

        const token: string | null = await auth();
        if (!token) {
            return false;
        }

        const isExists = await axios.get(`${apiEndpoint}/telegram/${ctx.from.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (isExists.data.message === 'User not found') {

            const response = await axios.post(
                `${apiEndpoint}/telegram/create`,
                {
                    telegramChatId: ctx.from.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response)

        }
                        
        let data = await getData();
        if (data) {
            let message = data.greeting;
            await ctx.reply(message, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Начать диалог', callback_data: 'start-chat' }]
                    ]
                }
            });
        } else {
            console.error("Failed to get data");
        }
    } catch (error) {
        console.log(error);
    }
};


home.start(async (ctx: rlhubContext) => {
    await greeting(ctx)
});

home.action("vocabular", async (ctx) => {
    ctx.answerCbQuery()
    return ctx.scene.enter('vocabular')
})

home.action("sentences", async (ctx) => {
    return ctx.scene.enter('sentences')
})

home.action("start-chat", async (ctx: rlhubContext) => await renderAction(ctx))
async function renderAction(ctx: rlhubContext) {
    try {

        ctx.wizard.selectStep(1)
        let data = await getData();
        if (data) {

            let message = data.action

            message += `\n\n`
            const me = await getMe(ctx)

            if (!me) { return false }

            message += `<b>Осталось вопросов ${me.freeSpin}/3</b>`

            const extra: ExtraEditMessageText = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        // [{ text: 'Расклад таро', callback_data: 'taro-action' }],
                        [{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }],
                    ]
                }
            }

            await ctx.editMessageText(message, extra)

        }
    } catch (error) {
        console.log(error)
    }
}

home.enter(async (ctx) => { return await greeting(ctx) })

// home.on("message", async (ctx) => await greeting (ctx))
home.action(/\./, async (ctx) => {

    await greeting(ctx)

})

export default home
export { greeting }