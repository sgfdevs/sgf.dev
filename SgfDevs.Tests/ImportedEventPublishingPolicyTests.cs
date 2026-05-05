using System;
using SgfDevs.Dev.EventSync;
using Xunit;

namespace SgfDevs.Tests;

public class ImportedEventPublishingPolicyTests
{
    private readonly ImportedEventPublishingPolicy _policy = new();

    [Fact]
    public void ShouldBePublished_ReturnsTrueBeforeGracePeriodEnds()
    {
        var startsAtLocal = new DateTime(2026, 5, 6, 18, 30, 0);

        var result = _policy.ShouldBePublished(startsAtLocal, new DateTime(2026, 5, 6, 19, 29, 59));

        Assert.True(result);
    }

    [Fact]
    public void ShouldBePublished_ReturnsFalseOnceGracePeriodEnds()
    {
        var startsAtLocal = new DateTime(2026, 5, 6, 18, 30, 0);

        var result = _policy.ShouldBePublished(startsAtLocal, new DateTime(2026, 5, 6, 19, 30, 0));

        Assert.False(result);
    }

    [Fact]
    public void GetUnpublishAt_ReturnsOneHourAfterStart()
    {
        var startsAtLocal = new DateTime(2026, 5, 6, 18, 30, 0);

        var result = _policy.GetUnpublishAt(startsAtLocal);

        Assert.Equal(new DateTime(2026, 5, 6, 19, 30, 0), result);
    }
}
