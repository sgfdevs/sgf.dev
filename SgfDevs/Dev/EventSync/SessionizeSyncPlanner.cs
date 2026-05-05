using System;
using System.Collections.Generic;
using System.Linq;
using SgfDevs.Dev.EventSync.Sessionize;

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

        var importedSessions = sessionGroups
            .SelectMany(group => group.Sessions ?? [])
            .Where(session => session.IsServiceSession == false)
            .Where(session => string.Equals(session.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
            .Select(session => BuildImportedSession(session, speakerLookup, timeZone))
            .ToList();

        return importedSessions
            .GroupBy(session => session.StartsAtLocal.Date)
            .Select(BuildImportedEventPlan)
            .OrderBy(plan => plan.StartsAtLocal)
            .ToList();
    }

    internal static string BuildEventName(DateTime startsAtLocal) => $"Dev Night - {startsAtLocal:MMMM yyyy}";

    private static ImportedEventPlan BuildImportedEventPlan(IEnumerable<ImportedSessionPlan> sessions)
    {
        var orderedSessions = sessions
            .OrderBy(session => session.StartsAtLocal)
            .ToList();

        var eventStartsAtLocal = orderedSessions[0].StartsAtLocal;

        return new ImportedEventPlan(
            BuildEventName(eventStartsAtLocal),
            eventStartsAtLocal,
            orderedSessions.Select(session => session.Presentation).ToList());
    }

    private static ImportedSessionPlan BuildImportedSession(
        SessionizeSessionDto session,
        IReadOnlyDictionary<string, SessionizeSpeakerDto> speakerLookup,
        TimeZoneInfo timeZone)
    {
        var startsAtLocal = TimeZoneInfo.ConvertTimeFromUtc(ToUtc(session.StartsAt), timeZone);

        return new ImportedSessionPlan(
            startsAtLocal,
            BuildPresentationPlan(session, speakerLookup));
    }

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

    private record ImportedSessionPlan(
        DateTime StartsAtLocal,
        ImportedPresentationPlan Presentation);
}
