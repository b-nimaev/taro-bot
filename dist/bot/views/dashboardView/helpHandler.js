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
exports.spb = void 0;
const format_money_1 = __importDefault(require("../../utlis/format_money"));
const greeting_1 = __importDefault(require("./greeting"));
const IPayment_1 = require("../../../models/IPayment");
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const secret_key = process.env.secret_key;
// const publicKey: string | undefined = process.env.public_key;
const qiwiApi = new QiwiBillPaymentsAPI(secret_key);
function spb(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Поддержка проекта 💰</b> \n\n`;
            message += `<i>Номер телефона при клике скопируется</i>:\n`;
            message += `<i><code>+7 902 531 13 66</code> `;
            message += ` по-системе быстрых платежей на Юмани (выбран по-умолчанию)</i> \n\n`;
            message += `<i>/check  </i><code>Проверить платеж</code>\n`;
            message += `<i>/cancel  </i><code>Отменить операцию</code>`;
            ctx.wizard.selectStep(4);
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery('spb');
                yield ctx.editMessageText(message, { parse_mode: 'HTML' });
            }
            else {
                yield ctx.reply(message, { parse_mode: 'HTML' });
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.spb = spb;
function help_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Поддержка проекта 💰</b> \n\n`;
            // await get_link_for_payment(ctx)
            message += `Введите желаемую сумму \n\n`;
            message += `Минимальная сумма: 1 ₽\n`;
            message += `Максимальная сумма: 60 000 ₽`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
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
                if (ctx.update.callback_query.data) {
                    let data = ctx.update.callback_query.data;
                    if (data === 'crypto') {
                        let message = `Поддержка проекта 💰 \n\n`;
                        message += `Сеть: Bitcoin - BTC. \n\n <code>1NKbc2GzhYu1E7WVBy9YwQ1NwapJLdZQk7</code> \n\n`;
                        message += `Сеть: TRON (TRC20) - USDT. \n\n <code>TMnEQyxorwf5PTAQts3Vx21zQvbeEiudRm</code>`;
                        const extra = {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Success', callback_data: 'success' }],
                                    [{ text: 'Back', callback_data: 'back' }]
                                ]
                            }
                        };
                        yield ctx.editMessageText(message, extra);
                        ctx.answerCbQuery('crypto');
                        return ctx.wizard.selectStep(6);
                    }
                    if (data === 'spb') {
                        yield spb(ctx);
                    }
                    if (data === 'back') {
                        ctx.wizard.selectStep(0);
                        ctx.answerCbQuery();
                        yield (0, greeting_1.default)(ctx);
                    }
                    else {
                        const amountCb = parseFloat(data.replace('rub', ''));
                        ctx.scene.session.amount = amountCb;
                        yield reply_payment_info(ctx);
                    }
                    yield ctx.answerCbQuery();
                }
            }
            if (ctx.updateType === 'message') {
                let amount = 0;
                // @ts-ignore
                if (ctx.message.text) {
                    // @ts-ignore
                    if (parseFloat(ctx.message.text) > 0 && parseFloat(ctx.message.text) < 60000) {
                        // @ts-ignore
                        amount = parseFloat(ctx.message.text);
                        // @ts-ignore
                    }
                    else if (parseFloat(ctx.message.text) > 60000) {
                        amount = 60000;
                    }
                }
                // cохраняем введенную сумму
                ctx.scene.session.amount = amount;
                if (ctx.scene.session.amount) {
                    yield reply_payment_info(ctx);
                }
                else {
                    yield ctx.reply('Введите сумму в цифрах', extra);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = help_handler;
function reply_payment_info(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let amount_message = `<b>Поддержка проекта 💰</b> \n\n`;
        const currentDate = new Date();
        const futureDate = (currentDate.getTime() + 1 * 60 * 60 * 1000);
        let payment = yield new IPayment_1.Payment({
            user_id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id,
            amount: ctx.scene.session.amount,
            expirationDateTime: futureDate
        }).save();
        console.log(payment);
        let link = yield get_link_for_payment(ctx, ctx.scene.session.amount, payment._id.toString(), payment.expirationDateTime);
        amount_message += `Счёт сформирован на сумму ${(0, format_money_1.default)(ctx.scene.session.amount)} ₽\n`;
        let extra = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Оплатить',
                            url: link.payUrl
                        }
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
        if (ctx.updateType === 'message') {
            yield ctx.reply(amount_message, extra);
        }
        else {
            yield ctx.editMessageText(amount_message, extra);
        }
    });
}
function get_link_for_payment(ctx, amount, billID, expirationDateTime) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                amount: amount.toFixed(2),
                currency: 'RUB',
                account: `${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id}`,
                expirationDateTime: expirationDateTime,
                comment: 'На сохранение бурятского яызыка',
                email: 'alexandrbnimaev@yandex.ru',
                successUrl: `https://profori.pro/telegraf/secret_path/success?billId=${billID}`
            };
            let link = qiwiApi.createBill(billID, params);
            return link;
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=helpHandler.js.map