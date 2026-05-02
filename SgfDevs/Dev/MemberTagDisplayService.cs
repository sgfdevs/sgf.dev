using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace SgfDevs.Dev;

public class MemberTagDisplayService
{
    private static readonly Regex SupportingMemberRegex = new("^(\\d{4})\\s+Supporting Member$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public IReadOnlyList<string> GetDisplayMemberTags(Member member)
    {
        var tags = member?.MemberTags?.OfType<Tag>() ?? [];
        return GetDisplayMemberTags(tags);
    }

    public IReadOnlyList<string> GetDisplayMemberTags(IEnumerable<Tag> tags)
    {
        return FormatDisplayMemberTags((tags ?? []).Select(GetDisplayName));
    }

    internal IReadOnlyList<string> FormatDisplayMemberTags(IEnumerable<string> tagNames)
    {
        var displayTags = new List<string>();
        var seenTags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var supportingYears = new SortedSet<int>();
        int? supportingInsertIndex = null;

        foreach (var tagName in tagNames ?? [])
        {
            if (string.IsNullOrWhiteSpace(tagName))
            {
                continue;
            }

            var supportingYear = GetSupportingMemberYear(tagName);
            if (supportingYear.HasValue)
            {
                supportingInsertIndex ??= displayTags.Count;
                supportingYears.Add(supportingYear.Value);
                continue;
            }

            if (seenTags.Add(tagName))
            {
                displayTags.Add(tagName);
            }
        }

        if (supportingYears.Count > 0)
        {
            var combinedSupportingMemberTag = $"{FormatSupportingMemberYears(supportingYears)} Supporting Member";
            displayTags.Insert(supportingInsertIndex ?? displayTags.Count, combinedSupportingMemberTag);
        }

        return displayTags;
    }

    private static string GetDisplayName(Tag tag)
    {
        return !string.IsNullOrWhiteSpace(tag?.DisplayName) ? tag.DisplayName : tag?.Name;
    }

    private static int? GetSupportingMemberYear(string tagName)
    {
        var match = SupportingMemberRegex.Match(tagName);
        return match.Success ? int.Parse(match.Groups[1].Value) : null;
    }

    private static string FormatSupportingMemberYears(IEnumerable<int> years)
    {
        return string.Join(", ", GetConsecutiveYearRanges(years).Select(range => FormatRange(range.Start, range.End)));
    }

    private static string FormatRange(int startYear, int endYear)
    {
        return startYear == endYear ? startYear.ToString() : $"{startYear}-{endYear}";
    }

    private static IEnumerable<(int Start, int End)> GetConsecutiveYearRanges(IEnumerable<int> years)
    {
        using var enumerator = years.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            yield break;
        }

        var rangeStart = enumerator.Current;
        var rangeEnd = rangeStart;

        while (enumerator.MoveNext())
        {
            var year = enumerator.Current;
            if (year == rangeEnd + 1)
            {
                rangeEnd = year;
                continue;
            }

            yield return (rangeStart, rangeEnd);
            rangeStart = rangeEnd = year;
        }

        yield return (rangeStart, rangeEnd);
    }
}
