using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web;
using Umbraco.Web.Mvc;

namespace SgfDevs.Dev
{
    public class UmbracoVirtualNodeByUrlRouteHandler : UmbracoVirtualNodeRouteHandler
    {
        private readonly string url;

        public UmbracoVirtualNodeByUrlRouteHandler(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new ArgumentException($"'{nameof(url)}' cannot be null or whitespace", nameof(url));
            }

            this.url = url;
        }
        protected override IPublishedContent FindContent(RequestContext requestContext, UmbracoContext umbracoContext)
        {
            return umbracoContext.Content.GetByRoute(url);
        }
    }
}