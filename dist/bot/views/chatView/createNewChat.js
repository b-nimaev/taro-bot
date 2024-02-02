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
Object.defineProperty(exports, "__esModule", { value: true });
function create_new_chat_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
            }
            else if (ctx.updateType === 'message' && ctx.update.message.text) {
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.default = create_new_chat_handler;
//# sourceMappingURL=createNewChat.js.map