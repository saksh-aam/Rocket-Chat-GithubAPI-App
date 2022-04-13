import { IApiEndpointMetadata } from '@rocket.chat/apps-engine/definition/api';
import { GitHubIntegrationApp } from '../../GitHubIntegrationApp';

export async function getWebhookUrl(app: GitHubIntegrationApp): Promise<string> {
    const accessors = app.getAccessors();

    const webhookEndpoint = accessors.providedApiEndpoints.find((endpoint) => endpoint.path === 'webhook') as IApiEndpointMetadata;
    const siteUrl = await accessors.environmentReader.getServerSettings().getValueById('Site_Url');

    return siteUrl + webhookEndpoint.computedPath;
}
