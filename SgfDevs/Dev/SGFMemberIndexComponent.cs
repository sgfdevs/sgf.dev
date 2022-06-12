using Umbraco.Cms.Core.Composing;
using Examine;
using System;
using System.Collections.Generic;
using Umbraco.Cms.Core.Web;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace SGFDevs.Dev;

public class SGFMemberIndexComponent : IComponent
{
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IExamineManager _examineManager;
    private readonly IMemberService _memberService;
    private readonly ILogger<SGFMemberIndexComponent> _logger;

    public SGFMemberIndexComponent(IUmbracoContextFactory umbracoContextFactory, IExamineManager examineManager, ILogger<SGFMemberIndexComponent> logger, IMemberService memberService)
    {
        _umbracoContextFactory = umbracoContextFactory;
        _examineManager = examineManager;
        _logger = logger;
        _memberService = memberService;
    }

    public void Initialize()
    {
        // Get the member index
        if (!_examineManager.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out IIndex index))
            return;

        ((BaseIndexProvider)index).TransformingIndexValues += IndexProviderTransformingIndexValues;
    }
    
    private void IndexProviderTransformingIndexValues(object sender, IndexingItemEventArgs e)
    {
        if (int.TryParse(e.ValueSet.Id, out var nodeId))
        {
            //switch (e.ValueSet.ItemType)
            //{

            //}

            using (var umbracoContext = _umbracoContextFactory.EnsureUmbracoContext())
            {
                var memberNode = _memberService.GetById(nodeId);

                //if(memberNode != null && memberNode.Name.Contains("Myke"))
                if(memberNode != null)
                {
                    //System.Diagnostics.Debugger.Launch();
                    var skills = memberNode.GetValue("skillsTags");
                    var skillsIndexValue = new List<string>();
                    var skillKeysValue = new List<string>();
                    var skillIdsValue = new List<string>();

                    if (skills != null)
                    {
                        var skillGuids = skills.ToString().Split(',');

                        foreach (var skillGuid in skillGuids)
                        {
                            //Udi.Parse(skillGuid)
                            
                            var skill = umbracoContext.UmbracoContext.Content.GetById(UdiParser.Parse(skillGuid)) as Tag;
                            skillsIndexValue.Add(string.IsNullOrEmpty(skill.DisplayName) ? skill.Name : skill.DisplayName);
                            skillKeysValue.Add(skill.Key.ToString());
                            skillIdsValue.Add(skill.Id.ToString());
                        }
                        
                        e.ValueSet.Set("skills", string.Join(",", skillsIndexValue.ToArray()));
                        e.ValueSet.Set("skillKeys", string.Join(",", skillKeysValue.ToArray()));
                        e.ValueSet.Set("skillIds", string.Join(",", skillIdsValue.ToArray()));
                    }
                }
            }
        }
    }

    public void Terminate()
    {
        throw new NotImplementedException();
    }
}

public class ConfigureIndexComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Components().Append<SGFMemberIndexComponent>();
    }
}