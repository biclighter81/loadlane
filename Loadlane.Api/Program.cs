using Application.Logging;
using Application.Services;
using Infrastructure.Context;
using Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

// Configuration Options
builder.Services.Configure<MapboxOptions>(builder.Configuration.GetSection("Mapbox"));

// Add Infrastructure Services (includes logging)
builder.Services.AddScoped<ILoggerManager, LoggerManager>();

// Add Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        (o) => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
        .UseSnakeCaseNamingConvention()
);

// Add Application Services
builder.Services.AddScoped<DirectionsService>();
builder.Services.AddScoped<RouteSampler>();

var app = builder.Build();

app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();
