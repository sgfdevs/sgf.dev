using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Examine;
using Examine.Providers;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.Services;
using Umbraco.Examine;
using Umbraco.Web;
using Umbraco.Web.PublishedModels;

namespace SgfDevs.Dev
{
    public class SGFMemberIndexComposer : ComponentComposer<SGFMemberIndexComponent>
    {

    }

    public class SGFMemberIndexComponent : IComponent
    {
        private readonly IExamineManager _examineManager;
        private readonly IUmbracoContextFactory _umbracoContextFactory;

        public SGFMemberIndexComponent(IExamineManager examineManager, IUmbracoContextFactory umbracoContextFactory)
        {
            _examineManager = examineManager;
            _umbracoContextFactory = umbracoContextFactory;
        }

        public void Initialize()
        {
            // Get the member index
            if (!_examineManager.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out IIndex index))
                return;

            // Add a custom fields
            var skills = new FieldDefinition("skills", FieldDefinitionTypes.FullText);
            index.FieldDefinitionCollection.AddOrUpdate(skills);

            var skillKeysValue = new FieldDefinition("skillKeys", FieldDefinitionTypes.InvariantCultureIgnoreCase);
            index.FieldDefinitionCollection.AddOrUpdate(skillKeysValue);

            var skillIdsValue = new FieldDefinition("skillIds", FieldDefinitionTypes.InvariantCultureIgnoreCase);
            index.FieldDefinitionCollection.AddOrUpdate(skillIdsValue);

            ((BaseIndexProvider)index).TransformingIndexValues += SGFMemberIndexComponent_TransformingIndexValues;
        }

        private void SGFMemberIndexComponent_TransformingIndexValues(object sender, IndexingItemEventArgs e)
        {
            if (int.TryParse(e.ValueSet.Id, out var nodeId))
            {
                //switch (e.ValueSet.ItemType)
                //{

                //}

                using (var umbracoContext = _umbracoContextFactory.EnsureUmbracoContext())
                {
                    var memberNode = Current.Services.MemberService.GetById(nodeId);

                    
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
                                var skill = umbracoContext.UmbracoContext.Content.GetById(Udi.Parse(skillGuid)) as Tag;
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
            // Nooph
        }
    }

    public class ConfigureIndexComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            // Replace the default IUmbracoIndexConfig definition
            composition.RegisterUnique<IUmbracoIndexConfig, CustomIndexConfig>();
        }
    }

    public class CustomIndexConfig : UmbracoIndexConfig, IUmbracoIndexConfig
    {
        public CustomIndexConfig(IPublicAccessService publicAccessService) : base(publicAccessService)
        {
        }

        IValueSetValidator IUmbracoIndexConfig.GetMemberValueSetValidator()
        {
            var excludeFields = Constants.Conventions.Member.GetStandardPropertyTypeStubs().Keys;

            return new MemberValueSetValidator(null, null, null, excludeFields);
        }
    }
}