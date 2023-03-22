########################
### base
########################
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS base

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get update \
	&& apt-get install -y nodejs \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 

########################
### build
########################
FROM base AS development

########################
### build
########################
FROM base AS build

WORKDIR /src

COPY . .

RUN npm ci \
    && npm run build \
    && rm -rf node_modules && npm cache clean --force

RUN dotnet restore

RUN dotnet publish --configuration Release --no-restore --output /app

########################
### final
########################
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS production

WORKDIR /app

ENV ASPNETCORE_URLS "http://*:10600"

ENV DLL="SgfDevs.dll"

COPY --from=build /app .

RUN echo "#!/bin/sh\ndotnet ${DLL}" > ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 10600

ENTRYPOINT ["./entrypoint.sh"]
