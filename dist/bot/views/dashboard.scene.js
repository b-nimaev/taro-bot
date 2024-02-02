"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const telegraf_1 = require("telegraf");
const greeting_1 = __importDefault(require("./dashboardView/greeting"));
const helpHandler_1 = __importStar(require("./dashboardView/helpHandler"));
const axios_1 = __importDefault(require("axios"));
const path = require('path'); // добавляем модуль path
const pdf2pic = require('pdf2pic'); // Подключаем pdf2pic
const pdf = require('pdf-parse'); // Подключите библиотеку pdf-parse
const fs = require('fs'); // Подключаем модуль fs для работы с файлами
const handler = new telegraf_1.Composer();
const dashboard = new telegraf_1.Scenes.WizardScene("dashboard", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield about_project(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, helpHandler_1.default)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield reference_materials_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield spb_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield messages_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield crypto_pay_check(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield crypto_pay_check_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield referral_section_handler(ctx); }));
function referral_section_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield (0, greeting_1.default)(ctx);
                }
            }
        }
        catch (error) {
            ctx.wizard.selectStep(0);
            yield (0, greeting_1.default)(ctx);
            console.error(error);
        }
    });
}
function crypto_pay_check_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function crypto_pay_check(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                if (data === 'back') {
                    yield help(ctx);
                }
                if (data === 'success') {
                    const message = `Введите сумму перевода и сеть криптовалюты, для подтверждения \n\nНапример: <code>0.000456 btc</code>`;
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'back', callback_data: 'back' }]
                            ]
                        }
                    };
                    yield ctx.editMessageText(message, extra);
                }
            }
        }
        catch (error) {
            yield (0, greeting_1.default)(ctx);
            ctx.wizard.selectStep(0);
            console.error(error);
        }
    });
}
function messages_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    ctx.answerCbQuery();
                    return yield (0, greeting_1.default)(ctx);
                }
            }
            else {
                yield messages(ctx);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function spb_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                if (ctx.update.message.text) {
                    const message = ctx.update.message.text;
                    if (message === '/check') {
                        let reply_message = `Ваш перевод принят \nСпасибо 😇\n\n`;
                        reply_message += `После подтверждения зачисления, вам будет начислен рейтинг и присвоен соответствующий статус`;
                        yield ctx.reply(reply_message, { parse_mode: 'HTML' });
                        ctx.wizard.selectStep(0);
                        return (0, greeting_1.default)(ctx);
                    }
                    if (message === '/cancel') {
                    }
                    return (0, helpHandler_1.spb)(ctx);
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
// Секция справочных материалов
function reference_materials_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield (0, greeting_1.default)(ctx);
                }
                ctx.answerCbQuery();
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function reference_materials(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Справочные материалы</b>\n\n`;
            message += `Здесь вы можете поделиться своими справочными материалами и обогатить базу знаний сообщества, а также находить полезные материалы, предоставленные другими пользователями. \n\n`;
            message += `Независимо от того, ищете ли вы информацию для учебы, работы или личного развития, эта секция позволит вам легко находить и делиться ценными ресурсами.`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ callback_data: 'add', text: 'Загрузить файл' }],
                        [{ callback_data: 'back', text: 'Назад' }]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
            ctx.wizard.selectStep(3);
        }
        catch (error) {
            console.error(error);
        }
    });
}
dashboard.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, greeting_1.default)(ctx);
}));
dashboard.action("referral", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const message = `<b>Реферальная программа</b> \n\nВаша реферальная ссылка: <code>https://t.me/burlive_test_bot?start=ref_${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id}</code>`;
        const extra = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'back', callback_data: 'back' }]
                ]
            }
        };
        yield ctx.editMessageText(message, extra);
        ctx.answerCbQuery();
        ctx.wizard.selectStep(8);
    }
    catch (error) {
        console.error(error);
    }
}));
dashboard.action("messages", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield messages(ctx); }));
function messages(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Мои сообщения</b>\n\n`;
            message += `Новых сообщений нет`;
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Назад', callback_data: 'back'
                            }
                        ]
                    ]
                }
            };
            ctx.wizard.selectStep(5);
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery();
                yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
// Обработчики
dashboard.action("common_settings", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCbQuery('Личный кабинет / Настройки');
    return ctx.scene.enter('settings');
}));
function fetchPdfToBuffer(pdfUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pdfUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data); // Преобразуем массив байтов в буфер
        }
        catch (error) {
            console.error('Ошибка при загрузке PDF:', error);
            return null;
        }
    });
}
dashboard.on('document', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const file = ctx.message.document;
    const fileId = yield ctx.telegram.getFile(file.file_id);
    const fileLink = yield ctx.telegram.getFileLink(file.file_id);
    const destinationPath = path.join(__dirname, 'dashboardView/downloaded_pdfs', file.file_name); // устанавливаем путь для сохранения файла
    yield downloadPdf(fileLink.href, destinationPath); // вызываем функцию для скачивания файла
    ctx.reply('PDF-файл успешно загружен и сохранен.');
}));
dashboard.command('page', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const pageNumber = parseInt(ctx.message.text.split(' ')[1]);
    if (!isNaN(pageNumber)) {
        try {
            const imageBase64 = yield convertPageToImage(ctx, pageNumber);
            const imageBase64String = imageBase64; // Explicitly cast to string
            console.log(imageBase64);
            ctx.replyWithPhoto({ source: imageBase64String }, {
                reply_markup: {
                    inline_keyboard: [
                        [{ callback_data: 'back', text: 'Назад' }]
                    ]
                }
            });
        }
        catch (error) {
            ctx.reply('Произошла ошибка при обработке PDF-файла.');
            console.log(error);
        }
    }
    else {
        ctx.reply('Введите корректный номер страницы.');
    }
}));
function downloadPdf(pdfUrl, destinationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pdfUrl, {
                responseType: 'arraybuffer'
            });
            fs.writeFileSync(destinationPath, response.data);
            console.log(`PDF загружен и сохранен в ${destinationPath}`);
        }
        catch (error) {
            console.error('Ошибка при загрузке PDF:', error);
        }
    });
}
function convertPageToImage(ctx, pageNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.session.link) {
            return 'Файл не найден. Пожалуйста, отправьте PDF-файл сначала.';
        }
        const fileLink = ctx.scene.session.link;
        console.log(fileLink.href);
        yield downloadPdf(fileLink.href, './');
        // try {
        //     const options = {
        //         density: 100,
        //         saveFilename: "page" + pageNumber,
        //         savePath: "./images",
        //         format: "png",
        //         width: 600,
        //         height: 800
        //     };
        //     // console.log(file)
        //     const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        //     // const convert = pdf2pic.fromBase64(response.data, options);
        //     const pageToConvertAsImage = pageNumber;
        //     // return new Promise((resolve, reject) => {
        //     //     convert(pageToConvertAsImage, { responseType: "base64" })
        //     //         .then((resolveData: any) => {
        //     //             console.log("Page is now converted as image");
        //     //             resolve(resolveData.base64);
        //     //         })
        //     //         .catch((error: any) => {
        //     //             console.error('Ошибка при обработке PDF-файла:', error);
        //     //             reject(error);
        //     //         });
        //     // });
        // } catch (error) {
        //     console.error('Ошибка при обработке PDF-файла:', error);
        //     return 'Произошла ошибка при обработке PDF-файла.';
        // }
    });
}
// async function extractTextFromPage(ctx: rlhubContext, pageNumber: number) {
//     if (!ctx.scene.session.link) {
//         return 'Файл не найден. Пожалуйста, отправьте PDF-файл сначала.';
//     }
//     const fileLink = ctx.scene.session.link.href;
//     try {
//         const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
//         const data = await pdf(response.data);
//         const allPages = data.text.split('\n\n');
//         const pageIndex = pageNumber - 1;
//         if (pageIndex >= 0 && pageIndex < allPages.length) {
//             return allPages[pageIndex];
//         } else {
//             return 'Страница не найдена';
//         }
//     } catch (error) {
//         console.error('Ошибка при обработке PDF-файла:', error);
//         return 'Произошла ошибка при обработке PDF-файла.';
//     }
// }
function about_project(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                if (ctx.callbackQuery) {
                    // @ts-ignore
                    if (ctx.callbackQuery.data) {
                        // @ts-ignore
                        let data = ctx.callbackQuery.data;
                        if (data === 'back') {
                            ctx.wizard.selectStep(0);
                            yield ctx.answerCbQuery();
                            yield (0, greeting_1.default)(ctx);
                        }
                    }
                }
            }
            else {
                about_project_section_render(ctx);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
dashboard.action("about", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield about_project_section_render(ctx); }));
function about_project_section_render(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Немного о проекте</b> \n\n`;
            message += `Наш проект нацелен на развитие бурятского языка, который является важной частью культурного наследия Бурятии. \n\n`;
            message += `Мы стремимся сохранить и продвигать язык среди молодого поколения, создавая образовательные материалы и организуя языковые мероприятия. \n\n`;
            message += `Наша цель - сохранить богатство бурятской культуры и ее языка для будущих поколений. \n\n`;
            message += `<a href="https://telegra.ph/Kak-podelitsya-spravochnymi-materialami-08-10">Как перевести предложение?</a> \n`;
            message += `<a href="https://telegra.ph/Kak-podderzhat-proekt-09-02">Как поддержать проект?</a> \n`;
            message += `<a href="https://telegra.ph/Kak-podelitsya-spravochnymi-materialami-08-10">Как поделиться справочными материалами?</a> \n`;
            message += `<a href="https://telegra.ph/Kak-podelitsya-spravochnymi-materialami-08-10">Как предложить предложение для перевода?</a> \n\n`;
            message += `<i>Буду рад вашим вопросам и предложениям по улучшению сервиса!\n\n @frntdev</i>`;
            let extra = {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Назад',
                                callback_data: 'back',
                            }
                        ]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
                ctx.answerCbQuery();
                ctx.wizard.selectStep(1);
            }
            else {
                yield ctx.reply(message, extra);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
dashboard.action('reference_materials', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield reference_materials(ctx);
    return ctx.answerCbQuery();
}));
dashboard.action("help", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield help(ctx); }));
function help(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Поддержка проекта 💰</b> \n\n`;
            // await get_link_for_payment(ctx)
            message += `Введите желаемую сумму \n\n`;
            // <i>С миру по нитке!</i>\n\n`
            message += `Минимальная сумма: 1 ₽\n`;
            message += `Максимальная сумма: 60 000 ₽`;
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '50 ₽', callback_data: 'rub 50' },
                            { text: '250 ₽', callback_data: 'rub 250' },
                            { text: '500 ₽', callback_data: 'rub 500' }
                        ],
                        [
                            { text: '750 ₽', callback_data: 'rub 750' },
                            { text: '1250 ₽', callback_data: 'rub 1250' },
                            { text: '2500 ₽', callback_data: 'rub 2500' }
                        ],
                        [
                            { text: 'Система быстрых платежей', callback_data: 'spb' }
                        ],
                        [
                            { text: 'Криптовалюта', callback_data: 'crypto' }
                        ],
                        [
                            {
                                text: 'Назад',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
            }
            ctx.wizard.selectStep(2);
        }
        catch (err) {
            console.log(err);
        }
    });
}
dashboard.action("home", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('home');
}));
dashboard.action("contact", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.answerCbQuery('Обратная связь');
}));
exports.default = dashboard;
//# sourceMappingURL=dashboard.scene.js.map