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
exports.clear_chats = void 0;
const telegraf_1 = require("telegraf");
const IUser_1 = require("../../models/IUser");
const IChat_1 = require("../../models/IChat");
const chat_greeting_1 = __importDefault(require("./chatView/chat.greeting"));
const createNewChat_1 = __importDefault(require("./chatView/createNewChat"));
const sendRequest_1 = require("./chatView/sendRequest");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({ apiKey: process.env.apikey, });
const handler = new telegraf_1.Composer();
const chat = new telegraf_1.Scenes.WizardScene("chatgpt", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, createNewChat_1.default)(ctx); }), // не работает
(ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield new_chat_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_chat_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield saving_dialog(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield onload_dialog_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield instructionSceneHandler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield settingsChatGPTSectionHandler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield changeTokensSceneHandler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield changeModelSceneHandler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield changeTemperatureSceneHandler(ctx); }));
chat.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, chat_greeting_1.default)(ctx); }));
chat.command('main', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('home');
}));
// Генерация случайного целого числа от min до max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
chat.action("list", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield render_list_dialogs(ctx); }));
function render_list_dialogs(ctx) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({
                id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
            });
            let chats = [];
            if (user === null || user === void 0 ? void 0 : user.chats) {
                for (let i = 0; i < user.chats.length; i++) {
                    let dialog = yield IChat_1.ChatModel.findById(user.chats[i]);
                    if (dialog) {
                        // console.log(dialog)
                        chats.push(dialog);
                    }
                }
            }
            console.log(chats);
            let message = `<b>Мои диалоги</b>\n\n`;
            message += `Количество созданных диалогов: <b>${chats.length}</b>\n`;
            message += `Страница: <b>1/1</b>`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            };
            let row = [];
            for (let i = 0; i < chats.length; i++) {
                // message += `${i + 1}. ${chats[i].name} \n`
                let dialog_name = chats[i].name;
                if (dialog_name) {
                    let shortedString = (dialog_name === null || dialog_name === void 0 ? void 0 : dialog_name.length) > 20 ? (dialog_name === null || dialog_name === void 0 ? void 0 : dialog_name.substring(0, 20)) + "..." : dialog_name;
                    row.push({ text: `${shortedString}`, callback_data: `${i} chat` });
                    if (row.length == 2) {
                        extra.reply_markup.inline_keyboard.push(row);
                        row = [];
                    }
                    // extra.reply_markup?.inline_keyboard.push([{ text: `${shortedString}`, callback_data: '${i} chat' }])
                }
                else {
                    console.log('hasnt name');
                    yield IUser_1.User.findByIdAndUpdate(user._id, {
                        $pull: {
                            chats: chats[i]._id
                        }
                    });
                    return yield render_list_dialogs(ctx);
                }
            }
            if (row.length > 0) {
                extra.reply_markup.inline_keyboard.push(row);
            }
            console.log(extra.reply_markup.inline_keyboard);
            (_b = extra.reply_markup) === null || _b === void 0 ? void 0 : _b.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }]);
            yield ctx.editMessageText(message, extra).then(() => ctx.wizard.selectStep(3));
        }
        catch (error) {
            ctx.answerCbQuery("Возникла ошибка");
            console.error(error);
        }
    });
}
handler.action("home", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ctx.answerCbQuery();
        return yield ctx.scene.enter('home');
    }
    catch (error) {
        console.error(error);
    }
}));
handler.action("new_chat", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // находим пользователя
        const user = yield IUser_1.User.findOne({
            id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
        });
        if (!user || !user._id) {
            return ctx.answerCbQuery("Пользователь не найден!");
        }
        if (user.access_tokens === 0) {
            const message = `<a href="https://telegra.ph/Kak-priobresti-tokeny-10-21">Как приобрести токены?</a>`;
            yield ctx.editMessageText(message, { parse_mode: 'HTML', disable_web_page_preview: true });
            yield (0, chat_greeting_1.default)(ctx, true);
            return ctx.answerCbQuery("Закончились токены 🪫 😔");
        }
        // уведомление о создании комнаты
        let message = `Создание комнаты ...`;
        yield ctx.editMessageText(message, { parse_mode: 'HTML' });
        yield ctx.telegram.sendChatAction(ctx.from.id, "typing");
        let chat = {
            user_id: user._id,
            context: [
                { role: "system", content: "Твой API подключен к телеграмм боту, ты будешь сейчас переписываться с пользователем, поприветствуй пользователя" },
            ]
        };
        yield clear_chats(user);
        // await ChatModel.findById()
        yield new IChat_1.ChatModel(chat).save().then(((response) => __awaiter(void 0, void 0, void 0, function* () {
            if (!user) {
                return ctx.answerCbQuery("Пользователь не найден!");
            }
            yield IUser_1.User.findByIdAndUpdate(user._id, { $push: { chats: response._id } });
            // сохраняем айди чата в контекст бота 
            ctx.scene.session.current_chat = response._id;
        })));
        // console.log(ctx.scene.session.current_chat)
        let current_chat = ctx.scene.session.current_chat;
        let old = yield IChat_1.ChatModel.findById(current_chat);
        if (chat && chat.context) {
            yield IChat_1.ChatModel.findById(current_chat).then((document) => __awaiter(void 0, void 0, void 0, function* () {
                yield openai.chat.completions.create({
                    model: user.gpt_model,
                    temperature: user.temperature / 100,
                    max_tokens: 2000,
                    // @ts-ignore
                    messages: old.context,
                }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    var _b, _c;
                    if (response) {
                        if ((_b = response.choices[0].message) === null || _b === void 0 ? void 0 : _b.content) {
                            const left = user.access_tokens - response.usage.total_tokens;
                            yield ctx.editMessageText(((_c = response.choices[0].message) === null || _c === void 0 ? void 0 : _c.content) + `\n\n<code>Затрачено токенов: ${response.usage.total_tokens}</code>\n<code>Осталось: ${left > 0 ? left : 0}</code>`, { parse_mode: 'HTML' });
                            yield IUser_1.User.findByIdAndUpdate(user._id, {
                                $set: {
                                    access_tokens: left > 0 ? left : 0
                                }
                            }).then(() => {
                                console.log('токены вытчены');
                            });
                            ctx.wizard.selectStep(2);
                        }
                        yield IChat_1.ChatModel.findByIdAndUpdate(document === null || document === void 0 ? void 0 : document._id, {
                            $push: {
                                context: response.choices[0].message
                            }
                        });
                    }
                })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
                    console.error(error.response.data);
                }));
            }));
        }
    }
    catch (error) {
        console.error(error);
        return yield (0, chat_greeting_1.default)(ctx);
    }
}));
function clear_chats(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!user.chats) {
                return false;
            }
            user.chats.forEach((element, index) => __awaiter(this, void 0, void 0, function* () {
                if (element) {
                    const dialog = yield IChat_1.ChatModel.findById(element);
                    if (dialog) {
                        if (!dialog.name) {
                            yield IChat_1.ChatModel.findByIdAndDelete(dialog._id).then(() => __awaiter(this, void 0, void 0, function* () {
                                console.log(`${dialog._id} удалён`);
                                yield IUser_1.User.findByIdAndUpdate(user._id, {
                                    $pull: {
                                        chats: dialog._id
                                    }
                                }).then(() => __awaiter(this, void 0, void 0, function* () {
                                    console.log(`${dialog._id} удалён из записей пользователя`);
                                }));
                            }));
                        }
                    }
                }
            }));
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.clear_chats = clear_chats;
handler.action("chats", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    ctx.wizard.selectStep(3);
    ctx.answerCbQuery();
    let user = yield IUser_1.User.findOne({
        id: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id
    });
    let chats = yield IChat_1.ChatModel.find({
        user_id: user === null || user === void 0 ? void 0 : user._id
    });
    const itemsOnPerPage = 5;
    if (chats.length) {
        if (chats.length > itemsOnPerPage) {
            const pages = Math.ceil(chats.length / itemsOnPerPage);
            const sliced = chats.slice(0, itemsOnPerPage);
            sliced.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(element.name);
            }));
        }
        else {
            let message = 'Выберите чат, с которым хотите продолжить работу';
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            };
            chats.forEach((chat) => __awaiter(void 0, void 0, void 0, function* () {
            }));
            (_e = extra.reply_markup) === null || _e === void 0 ? void 0 : _e.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }]);
            yield ctx.editMessageText(message, extra);
            ctx.wizard.selectStep(3);
        }
    }
}));
handler.action("settings-chat-gpt", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield settingsChatGPTSectionRender(ctx); }));
function settingsChatGPTSectionRender(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Chat GPT / Настройки</b>`;
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            message += `\n\n<b>Надстройки GPT:</b>\n`;
            message += `Модель GPT: <b>${user.gpt_model}</b>\n`;
            message += `Максимальное количество токенов: <b>${user.max_tokens}</b>`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Выбрать языковую модель', callback_data: 'model' }],
                        [{ text: 'Изменить максимальное число токенов', callback_data: 'tokens' }],
                        [{ text: 'Настроить температуру', callback_data: 'temperature' }],
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            ctx.updateType === 'callback_query' ? ctx.editMessageText(message, extra) : ctx.reply(message, extra);
            ctx.wizard.selectStep(7);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeTokensSceneRender(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `Отправьте значение для изменения параметра <code>max_tokens</code>`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            ctx.updateType === 'callback_query' ? ctx.editMessageText(message, extra) : ctx.reply(message, extra);
            ctx.wizard.selectStep(8);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeTokensSceneHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    yield settingsChatGPTSectionRender(ctx);
                }
            }
            if (ctx.updateType === 'message') {
                let message = ctx.update.message.text;
                if (parseFloat(message) > 0) {
                    yield ctx.reply(`${parseFloat(message)}`);
                }
                else {
                    message = `Отправьте значение больше 0`;
                    yield ctx.reply(message);
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function settingsChatGPTSectionHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'temperature') {
                    yield changeTemperatureSceneRender(ctx);
                }
                if (data === 'tokens') {
                    yield changeTokensSceneRender(ctx);
                }
                if (data === 'model') {
                    yield changeModelSceneRender(ctx);
                }
                if (data === 'back') {
                    yield (0, chat_greeting_1.default)(ctx);
                }
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeTemperatureSceneRender(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `Отправьте значение температуры, которое хотите установить (От 1 до 99)`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            ctx.updateType === 'callback_query' ? ctx.editMessageText(message, extra) : ctx.reply(message, extra);
            ctx.wizard.selectStep(10);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeTemperatureSceneHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    yield settingsChatGPTSectionRender(ctx);
                }
            }
            if (ctx.updateType === 'message') {
                if (ctx.update.message.text) {
                    const temp = ctx.update.message.text;
                    if ((parseFloat(temp) >= 1) && (parseFloat(temp) <= 99)) {
                        yield ctx.reply(`${temp}`);
                    }
                    else {
                        const message = `Введите значние от 1 до 99`;
                        yield ctx.reply(message);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
handler.action("instruction", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield instructionRender(ctx); }));
function instructionRender(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Chat GPT / Инструкция для пользования</b>\n\n`;
            message += `<i><a href="https://telegra.ph/CHto-takoe-Chat-GPT-10-21">Что такое Chat GPT?</a></i>\n`;
            message += `<i><a href="https://telegra.ph/CHto-takoe-tokeny-10-22">Что такое токены?</a></i>\n`;
            message += `<i><a href="https://telegra.ph/CHto-takoe-temperatura-10-22">Что такое температура запроса?</a></i>\n`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                },
                disable_web_page_preview: true
            };
            ctx.updateType === 'callback_query' ? ctx.editMessageText(message, extra) : ctx.reply(message, extra);
            ctx.wizard.selectStep(6);
        }
        catch (error) {
            console.error();
        }
    });
}
function instructionSceneHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    return (0, chat_greeting_1.default)(ctx);
                }
                ctx.answerCbQuery(data);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeModelSceneHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    return yield settingsChatGPTSectionRender(ctx);
                }
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function changeModelSceneRender(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Укажите модель которую хотите использовать</b>`;
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            message += `\nТекущая модель: ${user.gpt_model}`;
            // ✅
            let models = [
                'gpt-3.5-turbo',
                'gpt-3.5-turbo-16k',
                'gpt-4',
                'gpt-4-0613'
            ];
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                    // [{ text: 'gpt-3.5-turbo', callback_data: 'use-model 3.5-turbo' }, { text: 'gpt-3.5-turbo-16k', callback_data: 'use-model 3.5-turbo16k' }],
                    // [{ text: 'gpt-4', callback_data: 'use-model 4' }, { text: 'gpt-4-0613', callback_data: 'use-model 4-0613' }],
                    // [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            let row = [];
            for (let i = 0; i < models.length; i++) {
                // extra
                const button = { text: `${models[i] === user.gpt_model ? '✅ ' + models[i] : models[i]}`, callback_data: `${models[i] === user.gpt_model ? 'skip' : 'use-model ' + models[i]} ${models[i]}` };
                row.push(button);
                if (row.length === 2) {
                    extra.reply_markup.inline_keyboard.push(row);
                    row = [];
                }
            }
            if (row.length > 0) {
                extra.reply_markup.inline_keyboard.push(row);
            }
            extra.reply_markup.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }]);
            ctx.updateType === 'callback_query' ? ctx.editMessageText(message, extra) : ctx.reply(message, extra);
            ctx.wizard.selectStep(9);
        }
        catch (error) {
            console.error(error);
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, chat_greeting_1.default)(ctx); }));
function select_chat_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield (0, chat_greeting_1.default)(ctx);
                }
                if (data.split(" ")[1] === 'chat') {
                    const user = yield IUser_1.User.findOne({ id: ctx.from.id });
                    console.log(user.chats);
                    const chatHistory = yield IChat_1.ChatModel.findById(user.chats[parseFloat(data.split(" ")[0])]);
                    console.log(chatHistory);
                    ctx.scene.session.current_chat = chatHistory._id;
                    ctx.answerCbQuery("История чата загружена!");
                    let message = `<b>Сохраненный диалог</b>\n\n`;
                    message += `Название диалога: <b>${chatHistory.name}</b>`;
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Продолжить диалог', callback_data: 'continue' }],
                                [{ text: 'Выгрузить историю диалога', callback_data: 'save-dialog' }],
                                [{ text: 'Удалить диалог', callback_data: 'delete-dialog' }],
                                [{ text: 'Назад', callback_data: 'back' }],
                            ]
                        }
                    };
                    yield ctx.editMessageText(message, extra).then(() => ctx.wizard.selectStep(5));
                    // const chat = await ChatModel.findById(user.chats[parseFloat(data.split(" ")[1])])
                    // console.log(chat)
                }
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function onload_dialog_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'continue') {
                }
                if (data === 'back') {
                    return yield render_list_dialogs(ctx);
                }
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function new_chat_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                if (ctx.update.message.text) {
                    ctx.replyWithChatAction('typing');
                    const message = ctx.update.message.text;
                    if (message === '/save') {
                        ctx.wizard.selectStep(4);
                        yield ctx.reply('Отправьте название, которое хотите присвоить диалогу');
                        return console.log('Saving');
                    }
                }
                return yield (0, sendRequest_1.sendRequest)(ctx);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
function saving_dialog(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                if (ctx.update.message.text) {
                    const ChatID = ctx.scene.session.current_chat;
                    yield IChat_1.ChatModel.findByIdAndUpdate(ChatID, {
                        $set: {
                            name: ctx.update.message.text
                        }
                    }).then(() => __awaiter(this, void 0, void 0, function* () {
                        yield ctx.reply(`Ваш диалог сохранен под названием <b>${ctx.update.message.text}</b>`, { parse_mode: 'HTML' });
                        return yield (0, chat_greeting_1.default)(ctx);
                    })).catch((error) => __awaiter(this, void 0, void 0, function* () {
                        yield ctx.reply('Возникла ошибка с базой данных');
                        console.error(error);
                    }));
                }
                else {
                    yield ctx.reply('Отправьте в виде текста');
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.default = chat;
//# sourceMappingURL=chat.scene.js.map