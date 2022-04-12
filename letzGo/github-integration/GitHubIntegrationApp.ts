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

export class GitHubIntegrationApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    // public async initialize(): Promise<void>{
    //     console.log("Hello!");
    // }
    protected async extendConfiguration(configuration:IConfigurationExtend){
        configuration.api.provideApi({
            visibility:ApiVisibility.PUBLIC,
            security:ApiSecurity.UNSECURE,
            endpoints:[
                new WebHookendpoint(this),
            ]
        })
        configuration.settings.provideSetting({
            id: 'github-username-alias',
            public: true,
            required: true,
            type: SettingType.STRING,
            packageValue: 'GitHub',
            i18nLabel: "github-username-alias",
            i18nDescription: "github-username-alias-description"
        });
    }
}
