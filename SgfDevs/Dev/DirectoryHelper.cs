using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web.PublishedModels;
using Umbraco.Web;
using SgfDevs.ViewModels;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Tag = Umbraco.Web.PublishedModels.Tag;

namespace SgfDevs.Dev
{
    public class DirectoryHelper
    {
        private IMemberService _memberService;

        public DirectoryHelper(IMemberService memberService)
        {
            _memberService = memberService;
        }

        public static List<Tag> GetSkills()
        {
            return GetTagGroupTags("skills");
        }

        private static List<Tag> GetTagGroupTags(string tagGroupName)
        {
            var helper = Umbraco.Web.Composing.Current.UmbracoHelper;
            var tags = new Tags(helper.ContentAtRoot().First(n => n.Name == "Tags"));
            var tagGroup = tags.FirstChild<TagGroup>(tg => tg.Name.ToLower() == tagGroupName.ToLower());

            if (tagGroup != null)
            {
                return tagGroup.Children<Tag>().ToList();
            }

            return null;
        }

        public static IEnumerable<IMember> GetAllMembers()
        {
            var helper = Umbraco.Web.Composing.Current.UmbracoHelper;
            IMemberService memberService = Umbraco.Core.Composing.Current.Services.MemberService;
            var allMembers = memberService.GetAll(0, 500, out long totalRecords);

            return allMembers;
        }
    }
}