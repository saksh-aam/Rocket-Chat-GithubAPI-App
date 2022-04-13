import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";

export class GithubCommands implements ISlashCommand{
    public command='github'
    public i18nParamsExample='github-command-example'
    public i18nDescription='github-command-description'
    public providesPreview=false;

    constructor (private readonly app:App){}
    public async executor(
        context:SlashCommandContext,
        read:IRead, 
        modify:IModify, 
        http:IHttp, 
        persis:IPersistence):Promise<void>{
            const message=await modify.getCreator().startMessage();
            const sender=await read.getUserReader().getById('creator-of-app');
            const room=context.getRoom();

            if(!room){
                throw new Error("Your room can't be found");
            }
            const usernameAlias= await read.getEnvironmentReader().getSettings().getById('github-username-alias')
            
            message
            .setSender(sender)
            .setUsernameAlias(usernameAlias.value)
            .setGroupable(false)
            .setRoom(room)
            .setText('Github slashcommand received');
            
            modify.getNotifier().notifyRoom(room, message.getMessage());
        }github
}