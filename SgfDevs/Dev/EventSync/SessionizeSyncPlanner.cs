using System;
using System.Collections.Generic;
using System.Linq;

namespace SgfDevs.Dev.EventSync;

public class SessionizeSyncPlanner
{
    public IReadOnlyList<ImportedEventPlan> BuildEventPlans(
        IEnumerable<SessionizeSessionsGroupDto> sessionGroups,
        IEnumerable<SessionizeSpeakerDto> speakers,
        TimeZoneInfo timeZone)
    {
        var speakerLookup = speakers
            .Where(speaker => string.IsNullOrWhiteSpace(speaker.Id) == false)
            .GroupBy(speaker => speaker.Id, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.Last(), StringComparer.OrdinalIgnoreCase);

        var acceptedSessions = sessionGroups
            .SelectMany(group => group.Sessions ?? [])
            .Where(session => session.IsServiceSession == false)
            .Where(session => string.Equals(session.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
            .Select(session => new
            {
                Session = session,
                StartsAtLocal = TimeZoneInfo.ConvertTimeFromUtc(ToUtc(session.StartsAt), timeZone)
            })
            .OrderBy(item => item.StartsAtLocal)
            .ToList();

        return acceptedSessions
            .GroupBy(item => item.StartsAtLocal.Date)
            .Select(group => new ImportedEventPlan(
                BuildEventName(group.Min(item => item.StartsAtLocal)),
                group.Min(item => item.StartsAtLocal),
                group.Select(item => BuildPresentationPlan(item.Session, speakerLookup)).ToList()))
            .OrderBy(plan => plan.StartsAtLocal)
            .ToList();
    }

    internal static string BuildEventName(DateTime startsAtLocal) => $"Dev Night - {startsAtLocal:MMMM yyyy}";

    private static ImportedPresentationPlan BuildPresentationPlan(
        SessionizeSessionDto session,
        IReadOnlyDictionary<string, SessionizeSpeakerDto> speakerLookup)
    {
        var presenters = (session.Speakers ?? [])
            .Select(speaker => BuildPresenterPlan(speaker, speakerLookup))
            .ToList();

        return new ImportedPresentationPlan(
            session.Id,
            session.Title,
            session.Description ?? string.Empty,
            presenters);
    }

    private static ImportedPresenterPlan BuildPresenterPlan(
        SessionizeSessionSpeakerDto speaker,
        IReadOnlyDictionary<string, SessionizeSpeakerDto> speakerLookup)
    {
        if (string.IsNullOrWhiteSpace(speaker.Id) == false && speakerLookup.TryGetValue(speaker.Id, out var detailedSpeaker))
        {
            return new ImportedPresenterPlan(
                speaker.Id,
                string.IsNullOrWhiteSpace(detailedSpeaker.FullName) ? speaker.Name : detailedSpeaker.FullName,
                detailedSpeaker.ProfilePicture);
        }

        return new ImportedPresenterPlan(speaker.Id, speaker.Name, null);
    }

    private static DateTime ToUtc(DateTime dateTime)
    {
        return dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
        };
    }
}
