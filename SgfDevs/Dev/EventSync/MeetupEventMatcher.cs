#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SgfDevs.Dev.EventSync.Meetup;

namespace SgfDevs.Dev.EventSync;

public class MeetupEventMatcher
{
    public MeetupApiEventDto? FindMatch(IEnumerable<MeetupApiEventDto> events, string sessionTitle, DateTime sessionStartsAtLocal)
    {
        var normalizedSessionTitle = Normalize(sessionTitle);

        return events
            .Where(meetupEvent => string.Equals(Normalize(meetupEvent.Title), normalizedSessionTitle, StringComparison.Ordinal))
            .Where(meetupEvent => Math.Abs((meetupEvent.DateTime.Date - sessionStartsAtLocal.Date).TotalDays) <= 2)
            .OrderBy(meetupEvent => Math.Abs((meetupEvent.DateTime - sessionStartsAtLocal).TotalMinutes))
            .FirstOrDefault();
    }

    internal static string Normalize(string value)
    {
        var builder = new StringBuilder(value.Length);
        var previousWasSeparator = false;

        foreach (var character in value.Trim().ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(character))
            {
                builder.Append(character);
                previousWasSeparator = false;
                continue;
            }

            if (previousWasSeparator == false)
            {
                builder.Append(' ');
                previousWasSeparator = true;
            }
        }

        return builder.ToString().Trim();
    }
}
