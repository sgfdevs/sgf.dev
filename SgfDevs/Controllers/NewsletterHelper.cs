using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SGFDevs.Controllers;

public class NewsletterHelper
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _endpoint;
    private readonly string _listId;

    public NewsletterHelper(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
        _endpoint = configuration["SGFDevs:NewsletterEndpoint"];
        _listId = configuration["SGFDevs:NewsletterListId"];
    }

    public async Task<bool> Subscribe(string email)
    {
        try
        {

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(_endpoint),
                Content = JsonContent.Create(new Dictionary<string, object>
                {
                    { "email", email },
                    { "list_uuids", new [] { _listId } },
                })
            };

            var client = _httpClientFactory.CreateClient();

            var response = await client.SendAsync(request);
            var jsonStream = await response.Content.ReadAsStreamAsync();

            var result = await JsonSerializer.DeserializeAsync<SubscribeResponseDto>(jsonStream);

            return result.Data;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return false;
        }
    }

    public class SubscribeResponseDto
    {
        public bool Data { get; set; }
    }
}
