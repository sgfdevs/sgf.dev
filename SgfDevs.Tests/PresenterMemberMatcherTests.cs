using System;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class PresenterMemberMatcherTests
{
    [Fact]
    public void MatchPresenter_MatchesUniqueNormalizedFullName()
    {
        var memberKey = Guid.NewGuid();
        var presenter = new ImportedPresenterPlan("speaker-1", "Bertram   Gilfoyle", null);
        var lookup = PresenterMemberMatcher.BuildMemberNameLookup(
        [
            (memberKey, "Bertram Gilfoyle", "Bertram", "Gilfoyle")
        ]);

        var result = PresenterMemberMatcher.MatchPresenter(presenter, lookup);

        Assert.Equal(memberKey, result.MatchedMemberKey);
    }

    [Fact]
    public void MatchPresenter_DoesNotMatchWhenMultipleMembersShareTheSameName()
    {
        var presenter = new ImportedPresenterPlan("speaker-1", "Dinesh Chugtai", null);
        var lookup = PresenterMemberMatcher.BuildMemberNameLookup(
        [
            (Guid.NewGuid(), "Dinesh Chugtai", "Dinesh", "Chugtai"),
            (Guid.NewGuid(), "Dinesh Chugtai", "Dinesh", "Chugtai")
        ]);

        var result = PresenterMemberMatcher.MatchPresenter(presenter, lookup);

        Assert.Null(result.MatchedMemberKey);
    }

    [Fact]
    public void MatchPresenter_DoesNotMatchWhenNoMemberExists()
    {
        var presenter = new ImportedPresenterPlan("speaker-1", "Jared Dunn", null);
        var lookup = PresenterMemberMatcher.BuildMemberNameLookup(Array.Empty<(Guid Key, string? Name, string? FirstName, string? LastName)>());

        var result = PresenterMemberMatcher.MatchPresenter(presenter, lookup);

        Assert.Null(result.MatchedMemberKey);
    }
}
