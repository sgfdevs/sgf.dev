#nullable enable
using System;

namespace SgfDevs.Dev.EventSync;

public static class EventSyncTimeZoneResolver
{
    public static TimeZoneInfo Resolve(string? configuredTimeZoneId)
    {
        if (string.IsNullOrWhiteSpace(configuredTimeZoneId))
        {
            return TimeZoneInfo.Local;
        }

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(configuredTimeZoneId);
        }
        catch (TimeZoneNotFoundException) when (string.Equals(configuredTimeZoneId, "America/Chicago", StringComparison.OrdinalIgnoreCase))
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time");
        }
    }
}
