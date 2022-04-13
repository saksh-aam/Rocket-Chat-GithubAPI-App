import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GitHubIntegrationApp } from '../GitHubIntegrationApp';
import { getWebhookUrl } from '../customLibraries/helperFunction/getWebhookUrl';
import { sendNotification } from '../customLibraries/helperFunction/sendNotification';
import { AppPersistence } from '../customLibraries/persistence';
import { getRepoName, GithubSDK } from '../customLibraries/sdk';

/**
 *Connect-let the user add the webhook to the specified git-hub reop
 *SetToken- get the token of github account to authenticate and access various access permissions of rpos
 */
enum Command {
    Connect = 'connect',
    SetToken = 'set-token',
}

export class GithubSlashcommand implements ISlashCommand {
    /*nternationalization (sometimes shortened to "I18N , meaning "I - eighteen letters -N") is the process of planning and implementing products and services so that they can easily be adapted to specific local languages and cultures, a process called localization .*/
    public command = 'github';
    public i18nParamsExample = 'slashcommand_params';
    public i18nDescription = 'slashcommand_description';
    public providesPreview = false;

    // instance created by the constructor takes the App as parameter where slash-commands are applied
    public constructor(private readonly app: GitHubIntegrationApp) {}
/* Basic structure of creating a slash-commands
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
*/        
    // executor is the main functions which brings various commands to life
    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const [command] = context.getArguments();

        switch (command) {
            case Command.Connect:
                await this.processConnectCommand(context, read, modify, http, persis);
                break;

            case Command.SetToken:
                await this.processSetTokenCommand(context, read, modify, http, persis);
                break;
        }
    }

    private async processConnectCommand(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const [, repoUrl] = context.getArguments();

        if (!repoUrl) {
            await sendNotification('Usage: `/github connect REPO_URL`', read, modify, context.getSender(), context.getRoom());
            return;
        }

        const repoName = getRepoName(repoUrl);

        if (!repoName) {
            await sendNotification('Invalid GitHub repo address', read, modify, context.getSender(), context.getRoom());
            return;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const accessToken = await persistence.getUserAccessToken(context.getSender());

        if (!accessToken) {
            await sendNotification(
                'You haven\'t configured your access key yet. Please run `/github set-token YOUR_ACCESS_TOKEN`',
                read,
                modify,
                context.getSender(),
                context.getRoom(),
            );
            return;
        }

        const sdk = new GithubSDK(http, accessToken);

        try {
            await sdk.createWebhook(repoName, await getWebhookUrl(this.app));
        } catch (err) {
            console.error(err);
            await sendNotification('Error connecting to the repo', read, modify, context.getSender(), context.getRoom());
            return;
        }

        await persistence.connectRepoToRoom(repoName, context.getRoom());

        await sendNotification('Successfully connected repo', read, modify, context.getSender(), context.getRoom());
    }

    private async processSetTokenCommand(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const [, accessToken] = context.getArguments();

        if (!accessToken) {
            await sendNotification('Usage: `/github set-token ACCESS_TOKEN`', read, modify, context.getSender(), context.getRoom());
            return;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader());

        await persistence.setUserAccessToken(accessToken, context.getSender());
        console.log(accessToken)
        await sendNotification('Successfully stored your key', read, modify, context.getSender(), context.getRoom());
    }
}
