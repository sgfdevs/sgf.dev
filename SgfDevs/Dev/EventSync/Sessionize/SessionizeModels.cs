#nullable enable
using System;
using System.Collections.Generic;

namespace SgfDevs.Dev.EventSync.Sessionize;

public class SessionizeSessionsGroupDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public List<SessionizeSessionDto> Sessions { get; set; } = [];
}

public class SessionizeSessionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool IsServiceSession { get; set; }
    public string? Status { get; set; }
    public List<SessionizeSessionSpeakerDto> Speakers { get; set; } = [];
}

public class SessionizeSessionSpeakerDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class SessionizeSpeakerDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
}

public record ImportedEventPlan(
    string Name,
    DateTime StartsAtLocal,
    IReadOnlyList<ImportedPresentationPlan> Presentations);

public record ImportedPresentationPlan(
    string SessionizeId,
    string Title,
    string Description,
    IReadOnlyList<ImportedPresenterPlan> Presenters);

public record ImportedPresenterPlan(
    string SessionizeSpeakerId,
    string Name,
    string? ProfileImageUrl,
    string? ProfileImageUdi = null);
