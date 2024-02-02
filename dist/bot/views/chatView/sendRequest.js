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
exports.sendRequest = void 0;
const openai_1 = __importDefault(require("openai"));
const IChat_1 = require("../../../models/IChat");
const dotenv_1 = __importDefault(require("dotenv"));
const chat_greeting_1 = __importDefault(require("../chatView/chat.greeting"));
const IUser_1 = require("../../../models/IUser");
dotenv_1.default.config();
const configuration = new openai_1.default({
    apiKey: process.env.apikey,
});
const openai = configuration;
function sendRequest(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ctx.telegram.sendChatAction(ctx.from.id, 'typing');
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            if (user === null) {
                return false;
            }
            if (ctx.updateType === 'message') {
                console.log(ctx.update.message.text);
                const chatID = ctx.scene.session.current_chat;
                yield IChat_1.ChatModel.findByIdAndUpdate(chatID, {
                    $push: {
                        context: {
                            role: 'user',
                            content: ctx.update.message.text
                        }
                    }
                });
                yield IChat_1.ChatModel.findById(chatID).then((document) => __awaiter(this, void 0, void 0, function* () {
                    if (document) {
                        if (document.context) {
                            yield openai.chat.completions.create({
                                model: user.gpt_model,
                                temperature: user.temperature / 100,
                                // @ts-ignore
                                messages: document.context
                            }).then((response) => __awaiter(this, void 0, void 0, function* () {
                                if (response) {
                                    // console.log(response.data.choices)
                                    if (response.choices) {
                                        if (response.choices[0]) {
                                            if (response.choices[0].message) {
                                                if (response.choices[0].message.content) {
                                                    const left = user.access_tokens - response.usage.total_tokens;
                                                    yield ctx.reply(response.choices[0].message.content + `\n\n<code>Затрачено токенов: ${response.usage.total_tokens}</code>\n<code>Осталось: ${left > 0 ? left : 0}</code>` + `\n\n\n/chat — <i>Новый диалог</i>\n/save — <i>Сохранить диалог</i>\n/home — <i>На главную</i>`, { parse_mode: 'HTML' });
                                                    yield IUser_1.User.findByIdAndUpdate(user._id, {
                                                        $set: {
                                                            access_tokens: left > 0 ? left : 0
                                                        }
                                                    }).then(() => {
                                                        console.log('токены вытчены');
                                                    });
                                                    if (left < 0) {
                                                        yield ctx.reply('Токены закончились');
                                                        yield ctx.reply('Перенаправление на главную...');
                                                        ctx.scene.enter("chatgpt");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                yield IChat_1.ChatModel.findByIdAndUpdate(document._id, {
                                    $push: {
                                        context: response.choices[0].message
                                    }
                                });
                            })).catch((error) => __awaiter(this, void 0, void 0, function* () {
                                yield ctx.reply('Возникла ошибка');
                                yield (0, chat_greeting_1.default)(ctx);
                                console.error(error.response.data);
                            }));
                        }
                    }
                }));
            }
            // let current_chat: ObjectId = ctx.scene.session.current_chat
            // let old = await ChatModel.findById(current_chat)
            // let chat = await ChatModel.findOneAndUpdate({
            //     _id: current_chat
            // }, {
            //     $set: {
            //         context: old?.context + '/n' + ctx.update.message.text.trim()
            //     }
            // })
            // let newDoc = await ChatModel.findById(current_chat)
            // const chatCompletion = await openai.createChatCompletion({
            //     model: "gpt-3.5-turbo",
            //     temperature: .1,
            //     // @ts-ignore
            //     messages: [{ role: "user", content: newDoc?.context.trim() }],
            // });
            // return chatCompletion
            // chatCompletion.data.choices[0].message?.content
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=sendRequest.js.map