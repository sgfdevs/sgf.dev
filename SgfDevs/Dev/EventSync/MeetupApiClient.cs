#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace SgfDevs.Dev.EventSync;

public class MeetupApiClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptions<EventSyncOptions> _options;
    private readonly ILogger<MeetupApiClient> _logger;

    public MeetupApiClient(
        IHttpClientFactory httpClientFactory,
        IOptions<EventSyncOptions> options,
        ILogger<MeetupApiClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options;
        _logger = logger;
    }

    public bool IsConfigured =>
        string.IsNullOrWhiteSpace(_options.Value.MeetupApi.BaseUrl) == false &&
        string.IsNullOrWhiteSpace(_options.Value.MeetupApi.ClientId) == false &&
        string.IsNullOrWhiteSpace(_options.Value.MeetupApi.ClientSecret) == false &&
        string.IsNullOrWhiteSpace(_options.Value.MeetupApi.GroupId) == false;

    public async Task<IReadOnlyList<MeetupApiEventDto>> GetEventsAsync(DateTime afterLocal, DateTime beforeLocal, CancellationToken cancellationToken)
    {
        if (IsConfigured == false)
        {
            return [];
        }

        var token = await GetAccessTokenAsync(cancellationToken);
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = BuildEventsUrl(afterLocal, beforeLocal);
        var results = new List<MeetupApiEventDto>();

        while (string.IsNullOrWhiteSpace(requestUrl) == false)
        {
            _logger.LogInformation("Fetching meetup events from {RequestUrl}", requestUrl);

            var response = await client.GetFromJsonAsync<MeetupApiEventsResponseDto>(requestUrl, cancellationToken);
            if (response == null)
            {
                break;
            }

            if (response.Items != null)
            {
                results.AddRange(response.Items.Where(item => item != null));
            }

            requestUrl = ToAbsoluteUrl(response.NextPageUrl);
        }

        return results;
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        var response = await client.PostAsJsonAsync(
            BuildAbsoluteUrl("/v1/auth"),
            new MeetupApiAuthRequestDto
            {
                ClientId = _options.Value.MeetupApi.ClientId,
                ClientSecret = _options.Value.MeetupApi.ClientSecret
            },
            cancellationToken);

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<MeetupApiAuthResponseDto>(cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("Meetup API auth response was empty.");

        return payload.AccessToken;
    }

    private string BuildEventsUrl(DateTime afterLocal, DateTime beforeLocal)
    {
        var query = new Dictionary<string, string?>
        {
            ["after"] = afterLocal.ToString("O"),
            ["before"] = beforeLocal.ToString("O"),
            ["limit"] = "100"
        };

        return QueryHelpers.AddQueryString(
            BuildAbsoluteUrl($"/v1/groups/{_options.Value.MeetupApi.GroupId}/events"),
            query);
    }

    private string BuildAbsoluteUrl(string path)
    {
        return $"{_options.Value.MeetupApi.BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";
    }

    private string? ToAbsoluteUrl(string? requestUrl)
    {
        if (string.IsNullOrWhiteSpace(requestUrl))
        {
            return null;
        }

        if (Uri.TryCreate(requestUrl, UriKind.Absolute, out _))
        {
            return requestUrl;
        }

        return BuildAbsoluteUrl(requestUrl);
    }
}
