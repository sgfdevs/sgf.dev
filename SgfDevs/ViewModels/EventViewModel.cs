using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web.PublishedModels;

namespace SgfDevs.ViewModels
{
    public class EventViewModel : AutoMapper.Profile
    {
        public string Name { get; set; }
        public IPublishedContent Image { get; set; }
        public string Location { get; set; }
        public string Price { get; set; }
        public string Host { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsDevNight { get; set; }
    }
}