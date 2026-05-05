using System;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class PresenterMemberMatcherTests
{
    [Fact]
    public void BuildSearchTerms_IncludesNormalizedNameOnce()
    {
        var result = PresenterMemberMatcher.BuildSearchTerms("Bertram   Gilfoyle");

        Assert.Equal(["bertram gilfoyle", "Bertram   Gilfoyle"], result);
    }

    [Fact]
    public void GetMatchedMemberKey_ReturnsSingleKeyWhenExactlyOneMatchExists()
    {
        var key = Guid.NewGuid();

        var result = PresenterMemberMatcher.GetMatchedMemberKey([key]);

        Assert.Equal(key, result);
    }

    [Fact]
    public void GetMatchedMemberKey_ReturnsNullWhenMultipleMatchesExist()
    {
        var result = PresenterMemberMatcher.GetMatchedMemberKey([Guid.NewGuid(), Guid.NewGuid()]);

        Assert.Null(result);
    }
}
