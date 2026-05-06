#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using SgfDevs.Dev.EventSync.Sessionize;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;

namespace SgfDevs.Dev.EventSync;

public class PresenterMemberMatcher
{
    private readonly Func<string, IReadOnlyList<Guid>> _findMembersByDisplayName;

    public PresenterMemberMatcher(IMemberService memberService)
    {
        _findMembersByDisplayName = searchTerm => FindMembersByDisplayName(memberService, searchTerm);
    }

    internal PresenterMemberMatcher(Func<string, IReadOnlyList<Guid>> findMembersByDisplayName)
    {
        _findMembersByDisplayName = findMembersByDisplayName;
    }

    public IReadOnlyList<ImportedPresenterPlan> MatchPresenters(IReadOnlyList<ImportedPresenterPlan> presenters)
    {
        return presenters
            .Select(MatchPresenter)
            .ToList();
    }

    private ImportedPresenterPlan MatchPresenter(ImportedPresenterPlan presenter)
    {
        var matchedMemberKey = FindUniqueMemberKey(presenter.Name);
        return matchedMemberKey.HasValue
            ? presenter with { MatchedMemberKey = matchedMemberKey.Value }
            : presenter;
    }

    private static Guid? GetMatchedMemberKey(IReadOnlyList<Guid> memberKeys)
    {
        return memberKeys.Count == 1 ? memberKeys[0] : null;
    }

    private static IReadOnlyList<string> BuildSearchTerms(string? name)
    {
        var normalizedName = NormalizeName(name);
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return [];
        }

        var searchTerms = new List<string> { normalizedName };
        var trimmedName = name?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName) == false && string.Equals(normalizedName, trimmedName, StringComparison.OrdinalIgnoreCase) == false)
        {
            searchTerms.Add(trimmedName);
        }

        return searchTerms
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private Guid? FindUniqueMemberKey(string? presenterName)
    {
        var memberKeys = BuildSearchTerms(presenterName)
            .SelectMany(FindMembersByDisplayName)
            .Distinct()
            .ToList();

        return GetMatchedMemberKey(memberKeys);
    }

    private static string NormalizeName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return string.Empty;
        }

        return string.Join(' ', name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Trim()
            .ToLowerInvariant();
    }

    private IReadOnlyList<Guid> FindMembersByDisplayName(string searchTerm) => _findMembersByDisplayName(searchTerm);

    private static IReadOnlyList<Guid> FindMembersByDisplayName(IMemberService memberService, string searchTerm)
    {
        const int pageIndex = 0;
        const int pageSize = 10;
        long totalRecords;

        return memberService
            .FindMembersByDisplayName(searchTerm, pageIndex, pageSize, out totalRecords, StringPropertyMatchType.Exact)
            .Select(member => member.Key)
            .ToList();
    }
}
