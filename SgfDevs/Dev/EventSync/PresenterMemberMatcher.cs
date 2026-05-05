#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using SgfDevs.Dev.EventSync.Sessionize;
using Umbraco.Cms.Core.Services;

namespace SgfDevs.Dev.EventSync;

public class PresenterMemberMatcher
{
    private readonly IMemberService _memberService;

    public PresenterMemberMatcher(IMemberService memberService)
    {
        _memberService = memberService;
    }

    public IReadOnlyList<ImportedPresenterPlan> MatchPresenters(IReadOnlyList<ImportedPresenterPlan> presenters)
    {
        var memberNameLookup = BuildMemberNameLookup(GetAllMemberNames());

        return presenters
            .Select(presenter => MatchPresenter(presenter, memberNameLookup))
            .ToList();
    }

    internal static ImportedPresenterPlan MatchPresenter(
        ImportedPresenterPlan presenter,
        IReadOnlyDictionary<string, IReadOnlyList<Guid>> memberNameLookup)
    {
        var normalizedName = NormalizeName(presenter.Name);
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return presenter;
        }

        if (memberNameLookup.TryGetValue(normalizedName, out var memberKeys) == false || memberKeys.Count != 1)
        {
            return presenter;
        }

        return presenter with { MatchedMemberKey = memberKeys[0] };
    }

    internal static IReadOnlyDictionary<string, IReadOnlyList<Guid>> BuildMemberNameLookup(IEnumerable<(Guid Key, string? Name, string? FirstName, string? LastName)> members)
    {
        return members
            .SelectMany(member => GetCandidateNames(member)
                .Select(name => new { Name = name, member.Key }))
            .GroupBy(item => item.Name, StringComparer.Ordinal)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<Guid>)group.Select(item => item.Key).Distinct().ToList(),
                StringComparer.Ordinal);
    }

    internal static string NormalizeName(string? name)
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

    private IEnumerable<(Guid Key, string? Name, string? FirstName, string? LastName)> GetAllMemberNames()
    {
        long pageIndex = 0;
        const int pageSize = 500;
        long totalRecords;

        do
        {
            var members = _memberService.GetAll(pageIndex, pageSize, out totalRecords).ToList();

            foreach (var member in members)
            {
                yield return (
                    member.Key,
                    member.Name,
                    member.GetValue<string>("firstName"),
                    member.GetValue<string>("lastName"));
            }

            pageIndex++;
        }
        while (pageIndex * pageSize < totalRecords);
    }

    private static IEnumerable<string> GetCandidateNames((Guid Key, string? Name, string? FirstName, string? LastName) member)
    {
        if (string.IsNullOrWhiteSpace(member.Name) == false)
        {
            yield return NormalizeName(member.Name);
        }

        var fullName = string.Join(' ', new[] { member.FirstName, member.LastName }.Where(value => string.IsNullOrWhiteSpace(value) == false));
        if (string.IsNullOrWhiteSpace(fullName) == false)
        {
            yield return NormalizeName(fullName);
        }
    }
}
