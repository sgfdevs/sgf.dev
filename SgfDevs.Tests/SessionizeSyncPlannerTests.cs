using System;
using System.Collections.Generic;
using SgfDevs.Dev.EventSync;
using Xunit;

namespace SgfDevs.Tests;

public class SessionizeSyncPlannerTests
{
    private readonly SessionizeSyncPlanner _planner = new();
    private readonly MeetupEventMatcher _matcher = new();

    [Fact]
    public void BuildEventPlans_GroupsAcceptedSessionsByLocalDayAndUsesDetailedSpeakerData()
    {
        var sessionGroups = new[]
        {
            new SessionizeSessionsGroupDto
            {
                Sessions = new List<SessionizeSessionDto>
                {
                    new()
                    {
                        Id = "session-1",
                        Title = "Git internals + CTF 🚩",
                        Description = "learn git",
                        StartsAt = new DateTime(2026, 6, 3, 23, 30, 0, DateTimeKind.Utc),
                        Status = "Accepted",
                        Speakers = new List<SessionizeSessionSpeakerDto>
                        {
                            new() { Id = "speaker-1", Name = "Fallback Name" }
                        }
                    },
                    new()
                    {
                        Id = "session-2",
                        Title = "Ignored service session",
                        StartsAt = new DateTime(2026, 6, 3, 22, 0, 0, DateTimeKind.Utc),
                        Status = "Accepted",
                        IsServiceSession = true
                    },
                    new()
                    {
                        Id = "session-3",
                        Title = "Rejected session",
                        StartsAt = new DateTime(2026, 7, 1, 23, 30, 0, DateTimeKind.Utc),
                        Status = "Rejected"
                    }
                }
            }
        };

        var speakers = new[]
        {
            new SessionizeSpeakerDto
            {
                Id = "speaker-1",
                FullName = "Shay Nehmad",
                ProfilePicture = "https://sessionize.example/shay.jpg"
            }
        };

        var plans = _planner.BuildEventPlans(sessionGroups, speakers, TimeZoneInfo.Utc);

        var plan = Assert.Single(plans);
        Assert.Equal("Dev Night - June 2026", plan.Name);
        Assert.Equal(new DateTime(2026, 6, 3, 23, 30, 0), plan.StartsAtLocal);

        var presentation = Assert.Single(plan.Presentations);
        Assert.Equal("session-1", presentation.SessionizeId);
        Assert.Equal("Git internals + CTF 🚩", presentation.Title);
        Assert.Equal("learn git", presentation.Description);

        var presenter = Assert.Single(presentation.Presenters);
        Assert.Equal("Shay Nehmad", presenter.Name);
        Assert.Equal("https://sessionize.example/shay.jpg", presenter.ProfileImageUrl);
    }

    [Fact]
    public void BuildEventPlans_FallsBackToSessionSpeakerNameWhenSpeakerEndpointMissesDetails()
    {
        var sessionGroups = new[]
        {
            new SessionizeSessionsGroupDto
            {
                Sessions = new List<SessionizeSessionDto>
                {
                    new()
                    {
                        Id = "session-1",
                        Title = "Software History 101",
                        StartsAt = new DateTime(2026, 5, 6, 23, 30, 0, DateTimeKind.Utc),
                        Status = "Accepted",
                        Speakers = new List<SessionizeSessionSpeakerDto>
                        {
                            new() { Id = "missing-speaker", Name = "Trevor Glauz" }
                        }
                    }
                }
            }
        };

        var plans = _planner.BuildEventPlans(sessionGroups, Array.Empty<SessionizeSpeakerDto>(), TimeZoneInfo.Utc);

        var presenter = Assert.Single(Assert.Single(Assert.Single(plans).Presentations).Presenters);
        Assert.Equal("Trevor Glauz", presenter.Name);
        Assert.Null(presenter.ProfileImageUrl);
    }

    [Fact]
    public void FindMatch_MatchesNormalizedTitlesNearTheSameDate()
    {
        var sessionStartsAtLocal = new DateTime(2026, 6, 3, 18, 30, 0);
        var events = new[]
        {
            new MeetupApiEventDto
            {
                Id = "1",
                Title = "Git internals CTF",
                EventUrl = "https://meetup.example/events/1",
                DateTime = new DateTime(2026, 6, 3, 18, 0, 0)
            },
            new MeetupApiEventDto
            {
                Id = "2",
                Title = "Git internals CTF",
                EventUrl = "https://meetup.example/events/2",
                DateTime = new DateTime(2026, 6, 10, 18, 0, 0)
            }
        };

        var match = _matcher.FindMatch(events, "Git internals + CTF 🚩", sessionStartsAtLocal);

        Assert.NotNull(match);
        Assert.Equal("1", match!.Id);
    }

    [Fact]
    public void FindMatch_ReturnsNullWhenOnlyFarAwayDatesExist()
    {
        var events = new[]
        {
            new MeetupApiEventDto
            {
                Id = "1",
                Title = "Software History 101",
                EventUrl = "https://meetup.example/events/1",
                DateTime = new DateTime(2026, 5, 20, 18, 0, 0)
            }
        };

        var match = _matcher.FindMatch(events, "Software History 101", new DateTime(2026, 5, 6, 18, 30, 0));

        Assert.Null(match);
    }
}
