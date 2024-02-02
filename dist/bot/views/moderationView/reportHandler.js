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
const IReport_1 = require("../../../models/IReport");
const ISentence_1 = require("../../../models/ISentence");
const IUser_1 = require("../../../models/IUser");
const moderationTranslates_1 = __importDefault(require("./moderationTranslates"));
const reportRender_1 = __importDefault(require("./reportRender"));
function moderation_report_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query' || ctx.updateType === 'message') {
                if (ctx.updateType === 'callback_query') {
                    if (ctx.update.callback_query.data === 'continue' || ctx.update.callback_query.data === 'back') {
                        yield (0, moderationTranslates_1.default)(ctx);
                    }
                    ctx.answerCbQuery();
                }
                if (ctx.updateType === 'message') {
                    // отправка жалобы в канал
                    let senderReport = yield ctx.telegram.forwardMessage('-1001952917634', ctx.update.message.chat.id, ctx.message.message_id);
                    const user = yield IUser_1.User.findOne({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    });
                    if (user && user._id && ctx.scene.session.current_translation_for_vote) {
                        const report = {
                            user_id: user._id,
                            translation_id: ctx.scene.session.current_translation_for_vote,
                            message_id: senderReport.message_id
                        };
                        yield new IReport_1.ReportModel(report).save().then((report) => __awaiter(this, void 0, void 0, function* () {
                            var _b;
                            yield IUser_1.User.findOneAndUpdate({
                                id: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id
                            }, {
                                $push: {
                                    reports: report._id
                                }
                            });
                        }));
                        yield ISentence_1.Translation.findByIdAndUpdate(ctx.scene.session.current_translation_for_vote, {
                            $set: {
                                reported: true
                            }
                        });
                    }
                    let message = `<b>Спасибо!</b> \nВаше сообщение принято на рассмотрение.`;
                    yield ctx.reply(message, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Вернуться к модерации', callback_data: 'continue' }]
                            ]
                        }
                    });
                }
            }
            else {
                yield (0, reportRender_1.default)(ctx);
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = moderation_report_handler;
//# sourceMappingURL=reportHandler.js.map