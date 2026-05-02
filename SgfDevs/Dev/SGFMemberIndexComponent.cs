using Umbraco.Cms.Core.Composing;
using Examine;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Web;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace SGFDevs.Dev;

public class SGFMemberIndexComponent : IAsyncComponent
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

    public Task InitializeAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        // Get the member index
        if (!_examineManager.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out IIndex index))
            return Task.CompletedTask;

        ((BaseIndexProvider)index).TransformingIndexValues += IndexProviderTransformingIndexValues;
        return Task.CompletedTask;
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
                            var udi = UdiParser.Parse(skillGuid);

                            var skill = umbracoContext.UmbracoContext.Content.GetById(new GuidUdi(udi.UriValue).Guid) as Tag;
                            skillsIndexValue.Add(string.IsNullOrEmpty(skill.DisplayName) ? skill.Name : skill.DisplayName);
                            skillKeysValue.Add(skill.Key.ToString());
                            skillIdsValue.Add(skill.Id.ToString());
                        }

                        var updatedValues = new Dictionary<string, IEnumerable<object>>();

                        foreach (var kvp in e.ValueSet.Values)
                        {
                            updatedValues[kvp.Key] = kvp.Value;
                        }

                        updatedValues["skills"] = skillsIndexValue.ToArray();
                        updatedValues["skillKeys"] = skillKeysValue.ToArray();
                        updatedValues["skillIds"] = skillIdsValue.ToArray();

                        e.SetValues(updatedValues);
                    }
                }
            }
        }
    }

    public Task TerminateAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        if (_examineManager.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out IIndex index))
        {
            ((BaseIndexProvider)index).TransformingIndexValues -= IndexProviderTransformingIndexValues;
        }

        return Task.CompletedTask;
    }
}

public class ConfigureIndexComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Components().Append<SGFMemberIndexComponent>();
    }
}
