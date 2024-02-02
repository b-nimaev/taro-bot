"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.greeting = void 0;
const telegraf_1 = require("telegraf");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const yoo_checkout_1 = require("@a2seven/yoo-checkout");
const checkout = new yoo_checkout_1.YooCheckout({ shopId: '579916', secretKey: 'test_y3qEuwmGrbzcofTe0_QeFqhJryakOv-4z20Hu2fiDL0' });
const handler = new telegraf_1.Composer();
const home = new telegraf_1.Scenes.WizardScene("home", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield actionHandler(ctx); }));
const apiEndpoint = process.env.api_url;
function actionHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                const user = yield getMe(ctx);
                if (!user) {
                    return yield greeting(ctx);
                }
                if (user.freeSpin === 0) {
                    let data = yield getData();
                    if (!data) {
                        return false;
                    }
                    let extra = {
                        parse_mode: 'HTML',
                        // reply_markup: {
                        // inline_keyboard: [
                        // [{ text: 'Расклад таро', callback_data: 'taro-action' }],
                        // [{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }],
                        // ]
                        // }
                    };
                    let reply_markup = {
                        inline_keyboard: []
                    };
                    if (user.subscribe) {
                    }
                    else {
                        reply_markup.inline_keyboard.push([{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }]);
                        extra.reply_markup = reply_markup;
                    }
                    return ctx.reply(`У вас закончились бесплатные вопросы`, extra);
                }
                const response = yield axios_1.default.post(`${apiEndpoint}/telegram/question`, {
                    question: ctx.update.message.text,
                    telegramChatId: ctx.from.id
                }, {
                    headers: {
                        Authorization: `Bearer ${ctx.scene.session.token}`,
                    },
                });
                let message = response.data.answer;
                if (user.subscribe) {
                    message += `У вас действует подписка!`;
                }
                else {
                    message += `\n\nОсталось вопросов ${user.freeSpin - 1}/3`;
                }
                ctx.reply(`${message}`);
            }
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                console.log(data);
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.log(error.response.data.message);
        }
    });
}
function auth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const credentials = {
                email: 'admin@mail.ru',
                password: 'adminadmin',
            };
            const token = yield axios_1.default.post(`${apiEndpoint}/auth/login`, credentials)
                .then(response => {
                const token = response.data.token; // Полученный JWT-токен
                return token;
                // Теперь у вас есть токен, который можно использовать для запросов к защищенным ресурсам API
            })
                .catch(error => {
                console.error('Ошибка аутентификации:', error.response.data.message);
                return error.response.data.message;
            });
            return token;
        }
        catch (error) {
            // console.log(error)
            return error;
        }
    });
}
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield auth();
            if (!token) {
                return false;
            }
            const response = yield axios_1.default.get(`${apiEndpoint}/bin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data[0]; // Верните конкретное поле данных, если необходимо
        }
        catch (error) {
            return false;
        }
    });
}
function getMe(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield auth();
            if (!token) {
                return false;
            }
            ctx.scene.session.token = token;
            const response = yield axios_1.default.get(`${apiEndpoint}/telegram/${ctx.from.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.user; // Верните конкретное поле данных, если необходимо
        }
        catch (error) {
            return false;
        }
    });
}
const greeting = function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('greeting');
            const token = yield auth();
            if (!token) {
                return false;
            }
            const isExists = yield axios_1.default.get(`${apiEndpoint}/telegram/${ctx.from.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (isExists.data.message === 'User not found') {
                const response = yield axios_1.default.post(`${apiEndpoint}/telegram/create`, {
                    telegramChatId: ctx.from.id,
                    payload: ctx.startPayload,
                    firstName: ctx.from.first_name
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response);
            }
            let data = yield getData();
            if (data) {
                let message = data.greeting;
                yield ctx.reply(message, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Начать диалог', callback_data: 'start-chat' }]
                        ]
                    }
                });
            }
            else {
                console.error("Failed to get data");
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.greeting = greeting;
home.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield greeting(ctx);
}));
home.action("vocabular", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.answerCbQuery();
    return ctx.scene.enter('vocabular');
}));
home.action("sentences", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('sentences');
}));
home.action("start-chat", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield renderAction(ctx); }));
function renderAction(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ctx.wizard.selectStep(1);
            let data = yield getData();
            if (data) {
                let message = data.action;
                message += `\n\n`;
                const me = yield getMe(ctx);
                let extra = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                        // [{ text: 'Расклад таро', callback_data: 'taro-action' }],
                        // [{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }],
                        ]
                    }
                };
                if (!me) {
                    return false;
                }
                if (me.subscribe) {
                    message += `У вас действует подписка!`;
                }
                else {
                    message += `Осталось вопросов ${me.freeSpin - 1}/3`;
                    extra.reply_markup.inline_keyboard.push([{ text: `👑 Перейти на премиум от ${data.price} ₽ 👑`, callback_data: 'taro-action' }]);
                }
                yield ctx.editMessageText(message, extra);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
home.command('pay', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield getData();
    if (data) {
        let price = data.price;
        // const createWebHookPayload: ICreateWebHook = {
        //     event: 'payment.succeeded',
        //     url: 'https://91b4-65-21-153-43.ngrok-free.app/success'
        // };
        const createPayload = {
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
            const idempotenceKey = (0, uuid_1.v4)();
            const payment = yield checkout.createPayment(createPayload, idempotenceKey);
            yield axios_1.default.post(`${apiEndpoint}/telegram/new-payment`, {
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

💫 После завершения процедуры оплаты, вернитесь сюда, и мы продолжим наше увлекательное путешествие по картам вместе!`;
            ctx.reply(message, {
                parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти к оплате', url: `${payment.confirmation.confirmation_url}` }],
                        [{ text: 'Проверить оплату', callback_data: `check-pay ${payment.id}` }]
                    ]
                }
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}));
home.action(/^check-pay (.+)$/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const idempotenceKey = ctx.update.callback_query.data.replace("check-pay ", '');
    try {
        // Ваш код для проверки оплаты
        // ...
        const payment = yield checkout.getPayment(idempotenceKey);
        console.log(payment);
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
        }
        else {
            yield axios_1.default.post(`${apiEndpoint}/telegram/update-subscribe`, {
                telegramChatId: ctx.from.id
            }, {
                headers: {
                    Authorization: `Bearer ${ctx.scene.session.token}`,
                },
            });
            const message = `🎉 Поздравляю! 🌟 Вы успешно оформили подписку на наши волшебные гадания по Таро! Теперь вас ждет увлекательное путешествие в мир предсказаний и тайн.

✨ С каждым раскладом карт вы будете получать ценные и глубокие ответы на свои вопросы. Таро готово раскрывать перед вами свои секреты, чтобы осветить ваш путь.

🔮 Не забывайте задавать ваши вопросы, и я буду рад провести вас сквозь вихри судьбы. Если у вас появятся новые вопросы или нужна помощь, не стесняйтесь обращаться.

Спасибо за ваш выбор! 🚀 Приятного гадания! 😊✨`;
            yield ctx.reply(message, {
                parse_mode: 'HTML'
            });
            yield renderAction(ctx);
        }
        ctx.answerCbQuery();
    }
    catch (error) {
        console.error(error);
        ctx.reply('Произошла ошибка при проверке оплаты');
    }
}));
home.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield greeting(ctx); }));
// home.on("message", async (ctx) => await greeting (ctx))
home.action(/\./, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield greeting(ctx);
}));
exports.default = home;
//# sourceMappingURL=home.scene.js.map