using System;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class EventSyncImportFilterTests
{
    private readonly EventSyncImportFilter _filter = new();

    [Fact]
    public void GetUpcomingEvents_ExcludesPastEvents()
    {
        var nowLocal = new DateTime(2026, 6, 3, 18, 0, 0);
        var plans = new[]
        {
            new ImportedEventPlan("Past Dev Night", new DateTime(2026, 5, 6, 18, 30, 0), []),
            new ImportedEventPlan("Future Dev Night", new DateTime(2026, 7, 1, 18, 30, 0), [])
        };

        var result = _filter.GetUpcomingEvents(plans, nowLocal);

        var plan = Assert.Single(result);
        Assert.Equal("Future Dev Night", plan.Name);
    }

    [Fact]
    public void GetUpcomingEvents_KeepsEventsStartingNow()
    {
        var nowLocal = new DateTime(2026, 6, 3, 18, 30, 0);
        var plans = new[]
        {
            new ImportedEventPlan("Current Dev Night", nowLocal, []),
            new ImportedEventPlan("Next Dev Night", new DateTime(2026, 7, 1, 18, 30, 0), [])
        };

        var result = _filter.GetUpcomingEvents(plans, nowLocal);

        Assert.Equal(2, result.Count);
        Assert.Equal("Current Dev Night", result[0].Name);
    }
}
