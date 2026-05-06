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
            .Select(meetupEvent => new
            {
                Event = meetupEvent,
                MatchRank = GetMatchRank(normalizedSessionTitle, Normalize(meetupEvent.Title))
            })
            .Where(item => item.MatchRank.HasValue)
            .Where(item => Math.Abs((item.Event.DateTime.Date - sessionStartsAtLocal.Date).TotalDays) <= 2)
            .OrderBy(item => item.MatchRank)
            .ThenBy(item => Math.Abs((item.Event.DateTime - sessionStartsAtLocal).TotalMinutes))
            .Select(item => item.Event)
            .FirstOrDefault();
    }

    private static int? GetMatchRank(string normalizedSessionTitle, string normalizedMeetupTitle)
    {
        if (string.Equals(normalizedMeetupTitle, normalizedSessionTitle, StringComparison.Ordinal))
        {
            return 0;
        }

        if (ContainsWholePhrase(normalizedMeetupTitle, normalizedSessionTitle))
        {
            return 1;
        }

        if (ContainsWholePhrase(normalizedSessionTitle, normalizedMeetupTitle))
        {
            return 2;
        }

        return null;
    }

    private static bool ContainsWholePhrase(string source, string phrase)
    {
        if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(phrase))
        {
            return false;
        }

        return $" {source} ".Contains($" {phrase} ", StringComparison.Ordinal);
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
