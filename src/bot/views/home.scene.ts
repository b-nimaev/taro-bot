import { Composer, Scenes } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { ISentence, Sentence } from "../../models/ISentence";
import { IUser, User } from "../../models/IUser";
import rlhubContext from "../models/rlhubContext";
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from "telegraf/typings/core/types/typegram";
import { ICreatePayment, ICreateWebHook, YooCheckout } from '@a2seven/yoo-checkout';
const checkout = new YooCheckout({ shopId: '579916', secretKey: 'test_y3qEuwmGrbzcofTe0_QeFqhJryakOv-4z20Hu2fiDL0' });
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

                let extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    // reply_markup: {
                        // inline_keyboard: [
                            // [{ text: 'Расклад таро', callback_data: 'taro-action' }],
                            // [{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }],
                        // ]
                    // }
                }

                let reply_markup = {
                    inline_keyboard: []
                }

                if (user.subscribe) {

                } else {
                    reply_markup.inline_keyboard.push([{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }])
                    extra.reply_markup = reply_markup
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

            if (user.subscribe) {
                message += `\n\nУ вас действует подписка!`
            } else {
                message += `\n\nОсталось вопросов ${user.freeSpin - 1}/3`
            }


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
            email: 'admin@mail.ru',
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

async function getMe(ctx: rlhubContext): Promise<{ freeSpin: number, subscribe: boolean } | false> {
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
                    payload: ctx.startPayload,
                    firstName: ctx.from.first_name
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

            if (me.subscribe) {
                message += `\n\nУ вас действует подписка!`
            } else {
                message += `\n\nОсталось вопросов ${me.freeSpin - 1}/3`
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

            await ctx.editMessageText(message, extra)

        }
    } catch (error) {
        console.log(error)
    }
}

home.command('pay', async (ctx: rlhubContext) => {

    let data = await getData();
    if (data) {

        let price = data.price

        // const createWebHookPayload: ICreateWebHook = {
        //     event: 'payment.succeeded',
        //     url: 'https://91b4-65-21-153-43.ngrok-free.app/success'
        // };

        const createPayload: ICreatePayment = {
            amount: {
                value: `${price}.00`,
                currency: 'RUB'
            },
            payment_method_data: {
                type: 'bank_card'
            },
            confirmation: {
                type: 'redirect',
                return_url: 'test'
            },
            metadata: {
                telegramChatId: ctx.from.id
            }
        };

        try {

            const idempotenceKey = uuidv4();
            const payment = await checkout.createPayment(createPayload, idempotenceKey);

            await axios.post(`${apiEndpoint}/telegram/new-payment`, {
                id: payment.id,
                url: payment.confirmation.confirmation_url,
                telegramChatId: ctx.from.id
            }, {
                headers: {
                    Authorization: `Bearer ${ctx.scene.session.token}`,
                },
            });
            const message = `✨ Отлично! Вы готовы окунуться в мир магии и получить глубокие ответы на ваши вопросы. Для завершения гадания и получения детального расклада по Таро, вам необходимо произвести оплату.

🌟 Пожалуйста, кликните по следующей ссылке для осуществления оплаты: ${payment.confirmation.confirmation_url}.

💫 После завершения процедуры оплаты, вернитесь сюда, и мы продолжим наше увлекательное путешествие по картам вместе!`

            ctx.reply(message, {
                parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти к оплате', url: `${payment.confirmation.confirmation_url}` }],
                        [{ text: 'Проверить оплату', callback_data: `check-pay ${payment.id}` }]
                    ]
                }
            })

        } catch (error) {
            console.error(error);
        }

    }

});

home.action(/^check-pay (.+)$/, async (ctx) => {
    // @ts-ignore
    const idempotenceKey = ctx.update.callback_query.data.replace("check-pay ", '')

    try {
        // Ваш код для проверки оплаты
        // ...
        const payment = await checkout.getPayment(idempotenceKey);
        console.log(payment)
        // Отправка сообщения с результатом проверки

        if (!payment.paid) {
            ctx.reply(`Статус оплаты: ${payment.paid}`, {
                parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти к оплате', url: `${payment.confirmation.confirmation_url}` }],
                        [{ text: 'Проверить оплату', callback_data: `check-pay ${payment.id}` }]
                    ]
                }
            });
        } else {
            
            await axios.post(`${apiEndpoint}/telegram/update-subscribe`, {
                telegramChatId: ctx.from.id
            }, {
                headers: {
                    Authorization: `Bearer ${ctx.scene.session.token}`,
                },
            });

            const message = `🎉 Поздравляю! 🌟 Вы успешно оформили подписку на наши волшебные гадания по Таро! Теперь вас ждет увлекательное путешествие в мир предсказаний и тайн.

✨ С каждым раскладом карт вы будете получать ценные и глубокие ответы на свои вопросы. Таро готово раскрывать перед вами свои секреты, чтобы осветить ваш путь.

🔮 Не забывайте задавать ваши вопросы, и я буду рад провести вас сквозь вихри судьбы. Если у вас появятся новые вопросы или нужна помощь, не стесняйтесь обращаться.

Спасибо за ваш выбор! 🚀 Приятного гадания! 😊✨`

            await ctx.reply(message, {
                parse_mode: 'HTML'
            })

            await renderAction(ctx)

        }

        ctx.answerCbQuery()
    } catch (error) {
        console.error(error);
        ctx.reply('Произошла ошибка при проверке оплаты');
    }
});

home.enter(async (ctx) => { return await greeting(ctx) })

// home.on("message", async (ctx) => await greeting (ctx))
home.action(/\./, async (ctx) => {

    await greeting(ctx)

})

export default home
export { greeting }