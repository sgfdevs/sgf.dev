using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace SgfDevs.Dev;

public class MemberTagDisplayService
{
    public IReadOnlyList<string> GetDisplayMemberTags(Member member)
    {
        var tags = member?.MemberTags?.OfType<Tag>() ?? [];
        return GetDisplayMemberTags(tags);
    }

    public IReadOnlyList<string> GetDisplayMemberTags(IEnumerable<Tag> tags)
    {
        return (tags ?? [])
            .Select(GetDisplayName)
            .Where(tagName => !string.IsNullOrWhiteSpace(tagName))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string GetDisplayName(Tag tag)
    {
        return !string.IsNullOrWhiteSpace(tag?.DisplayName) ? tag.DisplayName : tag?.Name;
    }
}
