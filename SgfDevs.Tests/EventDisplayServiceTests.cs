using System;
using SgfDevs.Dev;
using SgfDevs.Dev.EventSync;
using Xunit;

namespace SgfDevs.Tests;

public class EventDisplayServiceTests
{
    private readonly EventDisplayService _service = new();

    [Fact]
    public void IsCurrentOrUpcoming_ReturnsTrueBeforeGracePeriodEnds()
    {
        var startsAtLocal = new DateTime(2026, 5, 6, 18, 30, 0);

        var result = _service.IsCurrentOrUpcoming(startsAtLocal, new DateTime(2026, 5, 6, 19, 29, 59));

        Assert.True(result);
    }

    [Fact]
    public void IsCurrentOrUpcoming_ReturnsFalseOnceGracePeriodEnds()
    {
        var startsAtLocal = new DateTime(2026, 5, 6, 18, 30, 0);

        var result = _service.IsCurrentOrUpcoming(startsAtLocal, new DateTime(2026, 5, 6, 19, 30, 0));

        Assert.False(result);
    }

    [Fact]
    public void GetCurrentOrNextEvent_SkipsExpiredEvents()
    {
        var now = new DateTime(2026, 5, 6, 20, 0, 0);
        var events = new[]
        {
            new DateTime(2026, 5, 6, 18, 30, 0),
            new DateTime(2026, 6, 3, 18, 30, 0)
        };

        var result = _service.GetCurrentOrNextEvent(events, static item => item, now);

        Assert.Equal(new DateTime(2026, 6, 3, 18, 30, 0), result);
    }

    [Fact]
    public void GetCurrentAndUpcomingEvents_ReturnsOnlyVisibleWindow()
    {
        var now = new DateTime(2026, 5, 6, 19, 0, 0);
        var events = new[]
        {
            new DateTime(2026, 4, 1, 18, 30, 0),
            new DateTime(2026, 5, 6, 18, 30, 0),
            new DateTime(2026, 6, 3, 18, 30, 0)
        };

        var result = _service.GetCurrentAndUpcomingEvents(events, static item => item, now);

        Assert.Equal(
            [new DateTime(2026, 5, 6, 18, 30, 0), new DateTime(2026, 6, 3, 18, 30, 0)],
            result);
    }

    [Fact]
    public void GetCurrentTime_UsesConfiguredEventTimeZone()
    {
        var service = new EventDisplayService(EventSyncTimeZoneResolver.Resolve("America/Chicago"));

        var result = service.GetCurrentTime(new DateTimeOffset(2026, 5, 6, 20, 46, 0, TimeSpan.Zero));

        Assert.Equal(new DateTime(2026, 5, 6, 15, 46, 0), result);
    }
}
