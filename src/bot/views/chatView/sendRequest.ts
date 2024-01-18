import OpenAI from "openai";
import rlhubContext from "../../models/rlhubContext";
import { ObjectId } from "mongoose";
import { ChatModel, IChat } from "../../../models/IChat";
import dotenv from 'dotenv';
import { FmtString } from "telegraf/typings/format";
import greeting from "../chatView/chat.greeting";
import { IUser, User } from "../../../models/IUser";
dotenv.config()
const configuration = new OpenAI({
    apiKey: process.env.apikey,
});

const openai = configuration

export async function sendRequest(ctx: rlhubContext) {
    try {
        
        await ctx.telegram.sendChatAction(ctx.from.id, 'typing');

        const user: IUser | null = await User.findOne({ id: ctx.from.id })

        if (user === null) {
            return false
        }

        if (ctx.updateType === 'message') {

            console.log(ctx.update.message.text)
            
            const chatID: ObjectId = ctx.scene.session.current_chat
            await ChatModel.findByIdAndUpdate(chatID, {
                $push: {
                    context: {
                        role: 'user',
                        content: ctx.update.message.text
                    }
                }
            })

            await ChatModel.findById(chatID).then(async (document) => {
                if (document) {
                    if (document.context) {
                        await openai.chat.completions.create({
                            model: user.gpt_model,
                            temperature: user.temperature / 100,
                            // @ts-ignore
                            messages: document.context
                        }).then(async (response) => {

                            if (response) {

                                // console.log(response.data.choices)
                                
                                if (response.choices) {

                                        if (response.choices[0]) {
                                            
                                            if (response.choices[0].message) {
                                                if (response.choices[0].message.content) {
                                                    
                                                    const left = user.access_tokens - response.usage.total_tokens

                                                    await ctx.reply(response.choices[0].message.content + `\n\n<code>Затрачено токенов: ${response.usage.total_tokens}</code>\n<code>Осталось: ${left > 0 ? left : 0}</code>` + `\n\n\n/chat — <i>Новый диалог</i>\n/save — <i>Сохранить диалог</i>\n/home — <i>На главную</i>`, { parse_mode: 'HTML' })
                                                
                                                    await User.findByIdAndUpdate(user._id, {
                                                        $set: {
                                                            access_tokens: left > 0 ? left : 0
                                                        }
                                                    }).then(() => {
                                                        console.log('токены вытчены')
                                                    })

                                                    if (left < 0) {
                                                        await ctx.reply('Токены закончились')
                                                        await ctx.reply('Перенаправление на главную...')
                                                        ctx.scene.enter("chatgpt")
                                                    }

                                                }
                                            }


                                        }

                                }
                            }


                            await ChatModel.findByIdAndUpdate(document._id, {
                                $push: {
                                    context: response.choices[0].message
                                }
                            })
                            
                        }).catch(async (error) => {
                            
                            await ctx.reply('Возникла ошибка')
                            await greeting(ctx)

                            console.error(error.response.data)
                        })
                    }
                }
            })
            

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
    } catch (err) {
        console.error(err)
    }
}
