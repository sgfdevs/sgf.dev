using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Web.WebApi;
using Examine;
using SgfDevs.ViewModels;
using Member = Umbraco.Web.PublishedModels.Member;
using Umbraco.Web;

namespace SgfDevs.Dev.WebAPI
{
    public class ProductsController : UmbracoApiController
    {
        [Route("api/tags/skills")]
        public IEnumerable<string> GetAllSkills()
        {
            var skills = DirectoryHelper.GetSkills().ToList();

            return skills.Select(x => string.IsNullOrEmpty(x.DisplayName) ? x.Name : x.DisplayName);
        }

        [Route("api/directory/filters/skills")]
        public IHttpActionResult GetSkillsFilters()
        {
            var _skills = DirectoryHelper.GetSkills().ToList();

            var skills = from x in _skills
                         select new
                         {
                             name = string.IsNullOrEmpty(x.DisplayName) ? x.Name : x.DisplayName,
                             id = x.Id,
                             key = x.Key,
                             isActive = false
                         };

            return Ok(skills.ToList());
        }

        [Route("api/directory/search")]
        public IHttpActionResult GetSearch()
        {
            var memberResults = new List<DirectoryResult>();

            // This is pretty much one massive brainstorm clustrer eff at this point. Psh.
            if (ExamineManager.Instance.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out var index))
            {
                var searcher = index.GetSearcher();
                var skillsQs = HttpContext.Current.Request.QueryString["skills"];

                // Send back all the members if no params are set
                if (skillsQs == null)
                {
                    var allMembers = DirectoryHelper.GetAllMembers();


                    foreach (var member in allMembers.OrderBy(m => m.CreateDate))
                    {
                        var node = Umbraco.Member(member.Id) as Member;
                        var url = "/member/" + node.Name.ToLower().Replace(" ", "-");
                        var location = node.City + ", " + node.State;

                        memberResults.Add(new DirectoryResult { Name = node.Name, Location = location, Image = node.ProfileImage.Url(), Url = url });
                    }

                    return Ok(memberResults);
                }

                // Otherwise hit Lucene/Examine
                var skillsParam = skillsQs.Split(',');
                var criteria = searcher.CreateQuery("member");
                var query = criteria.GroupedOr(new string[] { "nodeName", "skillKeys", "skillsTags", "skills", "skillIds" }, skillsParam);
                var results = query.Execute();

                if (results.Any())
                {
                    foreach (var result in results)
                    {
                        var node = Umbraco.Member(result.Id) as Member;
                        var url = "/member/" + node.Name.ToLower().Replace(" ", "-");
                        var location = node.City + ", " + node.State;

                        memberResults.Add(new DirectoryResult { Name = node.Name, Location = location, Image = node.ProfileImage.Url(), Url = url });
                    }

                    return Ok(memberResults.OrderBy(m => m.Name));
                }
            }

            return Ok(memberResults);
        }
    }

    public class AttributeRoutingComponent : IComponent
    {
        public void Initialize()
        {
            GlobalConfiguration.Configuration.MapHttpAttributeRoutes();
            GlobalConfiguration.Configuration.Formatters.Remove(GlobalConfiguration.Configuration.Formatters.XmlFormatter);
        }

        public void Terminate()
        {

        }
    }

    public class AttributeRoutingComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.Components().Append<AttributeRoutingComponent>(); ;
        }
    }
}