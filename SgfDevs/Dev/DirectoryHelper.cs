using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web.PublishedModels;
using Umbraco.Web;

namespace SgfDevs.Dev
{
    public class DirectoryHelper
    {
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
    }
}