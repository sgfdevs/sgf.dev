using System.Collections.Generic;
using Umbraco.Cms.Core.Services;
using System.Linq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Extensions;
using Tag = Umbraco.Cms.Web.Common.PublishedModels.Tag;

namespace SGFDevs.Dev;

public class DirectoryHelper
{
    private IMemberService _memberService;
    private UmbracoHelper _helper;
    
    public DirectoryHelper(IMemberService memberService, UmbracoHelper helper)
    {
        _memberService = memberService;
        _helper = helper;
    }
    
    public List<Tag> GetSkills()
    {
        return GetTagGroupTags("skills");
    }
    
    public List<Group> GetGroups()
    {
        var groups = _helper.ContentAtRoot().First(n => n.Name == "Home").Descendants<Group>().ToList();
        return groups ?? null;
    }
    
    private List<Tag> GetTagGroupTags(string tagGroupName)
    {
        var tags = _helper.ContentAtRoot().First(n => n.Name == "Tags");
        var tagGroup = tags.FirstChild<TagGroup>(tg => tg.Name.ToLower() == tagGroupName.ToLower());

        return tagGroup?.Children<Tag>().ToList();
    }

    public IEnumerable<IMember> GetAllMembers()
    {
        var allMembers = _memberService.GetAll(0, 500, out long totalRecords)
            .Where(u => !string.IsNullOrEmpty(u.GetValue<string>("City")) && !string.IsNullOrEmpty(u.GetValue<string>("State"))).OrderByDescending(d => d.CreateDate);

        return allMembers;
    }
}