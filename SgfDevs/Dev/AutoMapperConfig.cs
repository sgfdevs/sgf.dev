using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web.PublishedModels;
using SgfDevs.ViewModels;

namespace SgfDevs.Dev
{
    public static class AutoMapperConfig
    {
        public static IMapper Configure()
        {
            var config = new MapperConfiguration(cfg => {
                cfg.CreateMap<CommunityEvent, EventViewModel>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.City + ", " + src.State))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime))
                .ForMember(dest => dest.Host, opt => opt.MapFrom(src => src.HostName));

                cfg.CreateMap<Event, EventViewModel>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => "Springfield, MO"))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.Date))
                .ForMember(dest => dest.Host, opt => opt.MapFrom(src => "Springfield Devs"))
                .ForMember(dest => dest.IsDevNight, opt => opt.MapFrom(src => true));
            });

            var mapper = config.CreateMapper();

            return mapper;
        }
    }
}