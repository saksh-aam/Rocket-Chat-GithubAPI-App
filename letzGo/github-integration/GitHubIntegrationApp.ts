/* rc-apps actually run inside a Rocket.Chat server on an Node.js Virtual Machine */ 

import {
    IAppAccessors,
    IConfigurationExtend,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebHookendpoint } from './endpoints/WebHookendpoint';
import { GithubSlashcommand } from './slashcommands/github';

export class GitHubIntegrationApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
/* Whenever the app is deployed the message is printed in console successfully
    public async initialize(): Promise<void>{
        console.log("Hello!");
    }
*/

/*Below function is executed as part of the default initialization process of the App. It enables the App to provide robust functionalities such as API Endpoints or Slash Commands using the configuration accessor. */
    protected async extendConfiguration(configuration:IConfigurationExtend){
        configuration.api.provideApi({
            visibility:ApiVisibility.PUBLIC,
            security:ApiSecurity.UNSECURE,
            endpoints:[
                new WebHookendpoint(this),
            ]
        });

        /*All the setting related functionality are visible in the App Detail section in Rocket.Chat*/
        configuration.settings.provideSetting({
            id: 'github-username-alias',
            public: true,
            required: false,
            type: SettingType.STRING,
            packageValue: 'GitHub',
            i18nLabel: "github-username-alias",
            i18nDescription: "github-username-alias-description"
        });
        
        configuration.slashCommands.provideSlashCommand(new GithubSlashcommand(this));
    }
}
