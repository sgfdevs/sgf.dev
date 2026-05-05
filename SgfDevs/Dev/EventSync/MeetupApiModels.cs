#nullable enable
using System;
using System.Collections.Generic;

namespace SgfDevs.Dev.EventSync;

public class MeetupApiAuthRequestDto
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}

public class MeetupApiAuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
}

public class MeetupApiEventsResponseDto
{
    public List<MeetupApiEventDto> Items { get; set; } = [];
    public string? NextPageUrl { get; set; }
}

public class MeetupApiEventDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? EventUrl { get; set; }
    public DateTime DateTime { get; set; }
}
