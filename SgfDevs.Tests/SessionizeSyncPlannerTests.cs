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
                        Title = "Middle-Out Compression for Snack Delivery",
                        Description = "optimize the box",
                        StartsAt = new DateTime(2026, 6, 3, 23, 30, 0, DateTimeKind.Utc),
                        Status = "Accepted",
                        Speakers = new List<SessionizeSessionSpeakerDto>
                        {
                            new() { Id = "speaker-1", Name = "Mystery Hooli Engineer" }
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
                FullName = "Bertram Gilfoyle",
                ProfilePicture = "https://sessionize.example/gilfoyle.jpg"
            }
        };

        var plans = _planner.BuildEventPlans(sessionGroups, speakers, TimeZoneInfo.Utc);

        var plan = Assert.Single(plans);
        Assert.Equal("Dev Night - June 2026", plan.Name);
        Assert.Equal(new DateTime(2026, 6, 3, 23, 30, 0), plan.StartsAtLocal);

        var presentation = Assert.Single(plan.Presentations);
        Assert.Equal("session-1", presentation.SessionizeId);
        Assert.Equal("Middle-Out Compression for Snack Delivery", presentation.Title);
        Assert.Equal("optimize the box", presentation.Description);

        var presenter = Assert.Single(presentation.Presenters);
        Assert.Equal("speaker-1", presenter.SessionizeSpeakerId);
        Assert.Equal("Bertram Gilfoyle", presenter.Name);
        Assert.Equal("https://sessionize.example/gilfoyle.jpg", presenter.ProfileImageUrl);
        Assert.Null(presenter.ProfileImageUdi);
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
                        Title = "Pivot Tables for Decentralized Pied Pipers",
                        StartsAt = new DateTime(2026, 5, 6, 23, 30, 0, DateTimeKind.Utc),
                        Status = "Accepted",
                        Speakers = new List<SessionizeSessionSpeakerDto>
                        {
                            new() { Id = "missing-speaker", Name = "Dinesh Chugtai" }
                        }
                    }
                }
            }
        };

        var plans = _planner.BuildEventPlans(sessionGroups, Array.Empty<SessionizeSpeakerDto>(), TimeZoneInfo.Utc);

        var presenter = Assert.Single(Assert.Single(Assert.Single(plans).Presentations).Presenters);
        Assert.Equal("missing-speaker", presenter.SessionizeSpeakerId);
        Assert.Equal("Dinesh Chugtai", presenter.Name);
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
                Title = "Middle Out Compression for Snack Delivery",
                EventUrl = "https://meetup.example/events/1",
                DateTime = new DateTime(2026, 6, 3, 18, 0, 0)
            },
            new MeetupApiEventDto
            {
                Id = "2",
                Title = "Middle Out Compression for Snack Delivery",
                EventUrl = "https://meetup.example/events/2",
                DateTime = new DateTime(2026, 6, 10, 18, 0, 0)
            }
        };

        var match = _matcher.FindMatch(events, "Middle-Out Compression for Snack Delivery", sessionStartsAtLocal);

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
                Title = "Pied Piper Platform Launch",
                EventUrl = "https://meetup.example/events/1",
                DateTime = new DateTime(2026, 5, 20, 18, 0, 0)
            }
        };

        var match = _matcher.FindMatch(events, "Pied Piper Platform Launch", new DateTime(2026, 5, 6, 18, 30, 0));

        Assert.Null(match);
    }
}
