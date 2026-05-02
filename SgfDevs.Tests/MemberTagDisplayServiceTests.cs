using SgfDevs.Dev;
using Xunit;

namespace SgfDevs.Tests;

public class MemberTagDisplayServiceTests
{
    private readonly MemberTagDisplayService _service = new();

    [Fact]
    public void GetDisplayMemberTags_KeepsNonSupportingTagsAndDedupesCaseInsensitive()
    {
        var result = _service.FormatDisplayMemberTags(["Founding Member", "founding member", "Speaker"]);

        Assert.Equal(["Founding Member", "Speaker"], result);
    }

    [Fact]
    public void GetDisplayMemberTags_CollapsesConsecutiveSupportingYearsIntoSingleRange()
    {
        var result = _service.FormatDisplayMemberTags(["2024 Supporting Member", "2025 Supporting Member", "2026 Supporting Member"]);

        Assert.Equal(["2024-2026 Supporting Member"], result);
    }

    [Fact]
    public void GetDisplayMemberTags_CollapsesNonConsecutiveSupportingYearsIntoCommaSeparatedValues()
    {
        var result = _service.FormatDisplayMemberTags(["2022 Supporting Member", "2024 Supporting Member", "2026 Supporting Member"]);

        Assert.Equal(["2022, 2024, 2026 Supporting Member"], result);
    }

    [Fact]
    public void GetDisplayMemberTags_CollapsesMixedSupportingYearsIntoRangesAndSingles()
    {
        var result = _service.FormatDisplayMemberTags(["2022 Supporting Member", "2024 Supporting Member", "2025 Supporting Member", "2026 Supporting Member"]);

        Assert.Equal(["2022, 2024-2026 Supporting Member"], result);
    }

    [Fact]
    public void GetDisplayMemberTags_InsertsCombinedSupportingTagAtFirstSupportingPosition()
    {
        var result = _service.FormatDisplayMemberTags(["Founder", "2024 Supporting Member", "Volunteer", "2025 Supporting Member"]);

        Assert.Equal(["Founder", "2024-2025 Supporting Member", "Volunteer"], result);
    }

    [Fact]
    public void GetDisplayMemberTags_DoesNotCollapseMalformedSupportingTags()
    {
        var result = _service.FormatDisplayMemberTags(["Supporting Member", "2024 supporter", "2024 Supporting Member"]);

        Assert.Equal(["Supporting Member", "2024 supporter", "2024 Supporting Member"], result);
    }
}
