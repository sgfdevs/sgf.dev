using System;
using System.Collections.Generic;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class PresenterMemberMatcherTests
{
    [Fact]
    public void MatchPresenters_AssignsMemberKeyWhenExactlyOneMemberMatches()
    {
        var memberKey = Guid.NewGuid();
        var matcher = CreateMatcher(new Dictionary<string, IReadOnlyList<Guid>>
        {
            ["bertram gilfoyle"] = [memberKey]
        });

        var result = Assert.Single(matcher.MatchPresenters([new ImportedPresenterPlan("speaker-1", "Bertram   Gilfoyle", null)]));

        Assert.Equal(memberKey, result.MatchedMemberKey);
    }

    [Fact]
    public void MatchPresenters_LeavesPresenterUnchangedWhenNoMembersMatch()
    {
        var matcher = CreateMatcher(new Dictionary<string, IReadOnlyList<Guid>>());

        var result = Assert.Single(matcher.MatchPresenters([new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null)]));

        Assert.Null(result.MatchedMemberKey);
    }

    [Fact]
    public void MatchPresenters_LeavesPresenterUnchangedWhenMultipleMembersMatch()
    {
        var matcher = CreateMatcher(new Dictionary<string, IReadOnlyList<Guid>>
        {
            ["bertram gilfoyle"] = [Guid.NewGuid(), Guid.NewGuid()]
        });

        var result = Assert.Single(matcher.MatchPresenters([new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null)]));

        Assert.Null(result.MatchedMemberKey);
    }

    [Fact]
    public void MatchPresenters_DeduplicatesSameMemberReturnedByMultipleSearchTerms()
    {
        var memberKey = Guid.NewGuid();
        var matcher = CreateMatcher(new Dictionary<string, IReadOnlyList<Guid>>
        {
            ["bertram gilfoyle"] = [memberKey],
            ["Bertram   Gilfoyle"] = [memberKey]
        });

        var result = Assert.Single(matcher.MatchPresenters([new ImportedPresenterPlan("speaker-1", "Bertram   Gilfoyle", null)]));

        Assert.Equal(memberKey, result.MatchedMemberKey);
    }

    private static PresenterMemberMatcher CreateMatcher(IReadOnlyDictionary<string, IReadOnlyList<Guid>> resultsBySearchTerm)
    {
        return new PresenterMemberMatcher(searchTerm =>
            resultsBySearchTerm.TryGetValue(searchTerm, out var result)
                ? result
                : []);
    }

}
