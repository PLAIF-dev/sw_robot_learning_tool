FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY RobotLearningTool.sln ./
COPY RobotLearningTool.Api/RobotLearningTool.Api.csproj RobotLearningTool.Api/
COPY RobotLearningTool.Application/RobotLearningTool.Application.csproj RobotLearningTool.Application/
COPY RobotLearningTool.Domain/RobotLearningTool.Domain.csproj RobotLearningTool.Domain/
COPY RobotLearningTool.Infrastructure/RobotLearningTool.Infrastructure.csproj RobotLearningTool.Infrastructure/

RUN dotnet restore RobotLearningTool.sln

COPY . .
RUN dotnet publish RobotLearningTool.Api/RobotLearningTool.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RobotLearningTool.Api.dll"]
