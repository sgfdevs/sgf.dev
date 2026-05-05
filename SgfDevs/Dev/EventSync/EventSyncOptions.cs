#nullable enable
namespace SgfDevs.Dev.EventSync;

public class EventSyncOptions
{
    public bool EventSyncEnabled { get; set; }
    public SessionizeOptions Sessionize { get; set; } = new();
    public MeetupApiOptions MeetupApi { get; set; } = new();
    public string EventTimeZoneId { get; set; } = "America/Chicago";
}

public class SessionizeOptions
{
    public string BaseUrl { get; set; } = string.Empty;
}

public class MeetupApiOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
}
