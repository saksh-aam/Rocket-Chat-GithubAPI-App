import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api"
import { RoomType, IRoom } from "@rocket.chat/apps-engine/definition/rooms";

export class WebHookendpoint extends ApiEndpoint{
    public path='webhook';
    public async post(
        request:IApiRequest, 
        endpoint:IApiEndpointInfo, 
        read:IRead, 
        modify:IModify, 
        http:IHttp, 
        persis:IPersistence):Promise<IApiResponse>{
            const sender=await read.getUserReader().getById('creator-of-app');
            
    /* Code to connect and verify that our webhook is connected or not through message in the general channel
            const message=await modify.getCreator().startMessage();
            const room=await read.getRoomReader().getById('GENERAL');
            if(!room){
                throw new Error("Your room can't be found");
            }
            message
            .setSender(sender)
            .setUsernameAlias(usernameAlias.value)
            .setGroupable(false)
            .setRoom(room)
            .setText('Github webhook received');
    */

            const usernameAlias= await read.getEnvironmentReader().getSettings().getById('github-username-alias')

            const room=await read.getRoomReader().getById('GENERAL') || {} as IRoom;
            if(request.headers['X-GitHub-Event']!=='push'){
                return this.success();
            }

            let payload:any;

            if(request.headers['content-type']==='application/x-www-form-urlencoded'){
                payload=JSON.parse(request.content.payload);
            }else{
                payload=request.content;
            }

            const message =modify.getCreator().startMessage({
                room,
                sender,
                avatarUrl:payload.sender.avatar_url,
                alias:payload.sender.login,
                text:`[${payload.sender.login}](${payload.sender.html_url}) just pushed 
                ${payload.commits.length} commits to [${payload.repository.full_name}](${payload.repository.html_url})`,  
            });
            
            modify.getCreator().finish(message);
        return this.success();
    }
}