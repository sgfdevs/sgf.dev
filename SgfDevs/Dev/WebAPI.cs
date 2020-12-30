using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Web.WebApi;
using SgfDevs.Dev;

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