#nullable enable
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace SgfDevs.Dev.EventSync.Sessionize;

public class SessionizeApiClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptions<EventSyncOptions> _options;
    private readonly ILogger<SessionizeApiClient> _logger;

    public SessionizeApiClient(
        IHttpClientFactory httpClientFactory,
        IOptions<EventSyncOptions> options,
        ILogger<SessionizeApiClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options;
        _logger = logger;
    }

    public bool IsConfigured => string.IsNullOrWhiteSpace(_options.Value.Sessionize.BaseUrl) == false;

    public async Task<IReadOnlyList<SessionizeSessionsGroupDto>> GetSessionsAsync(CancellationToken cancellationToken)
    {
        var result = await GetFromJsonAsync<List<SessionizeSessionsGroupDto>>("Sessions", cancellationToken);
        return result ?? [];
    }

    public async Task<IReadOnlyList<SessionizeSpeakerDto>> GetSpeakersAsync(CancellationToken cancellationToken)
    {
        var result = await GetFromJsonAsync<List<SessionizeSpeakerDto>>("Speakers", cancellationToken);
        return result ?? [];
    }

    private async Task<T?> GetFromJsonAsync<T>(string relativePath, CancellationToken cancellationToken)
    {
        var baseUrl = _options.Value.Sessionize.BaseUrl.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return default;
        }

        var client = _httpClientFactory.CreateClient();
        var requestUrl = $"{baseUrl}/{relativePath}";

        _logger.LogInformation("Fetching Sessionize data from {RequestUrl}", requestUrl);
        return await client.GetFromJsonAsync<T>(requestUrl, cancellationToken);
    }
}
