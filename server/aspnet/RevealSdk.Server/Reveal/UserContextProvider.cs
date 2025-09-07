using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reveal.Sdk;
using RevealSdk.Server.Configuration;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.Json;

namespace RevealSdk.Server.Reveal
{
    public class UserContextProvider : IRVUserContextProvider
    {
        private readonly ServerOptions _sqlOptions;

        public UserContextProvider(IOptions<ServerOptions> sqlOptions, ILogger<UserContextProvider> logger)
        {
            _sqlOptions = sqlOptions.Value;
            
        }

        IRVUserContext IRVUserContextProvider.GetUserContext(HttpContext aspnetContext)
        {
            string? headerValue = aspnetContext.Request.Headers["x-header-one"].FirstOrDefault();
            string? userId = null;
            string? orderId = null;

            if (!string.IsNullOrEmpty(headerValue))
            {
                var pairs = headerValue.Split(',');
                foreach (var pair in pairs)
                {
                    var kv = pair.Split(':', 2);
                    if (kv.Length == 2)
                    {
                        var key = kv[0].Trim();
                        var value = kv[1].Trim();
                        if (key.Equals("userId", StringComparison.OrdinalIgnoreCase))
                            userId = value;
                        else if (key.Equals("orderId", StringComparison.OrdinalIgnoreCase))
                            orderId = value;
                    }
                }
            }
            // default to User role
            string role = "User";

            // null is used here just for demo 
            if (userId == "11" || userId == null)
            {
                role = "Admin";
            }

            var filterTables = role == "Admin"
                ? Array.Empty<string>()
                : ["customers", "orders", "order_details"];

            var props = new Dictionary<string, object>() {
                { "OrderId", orderId ?? string.Empty },
                { "Role", role },
                { "Host", _sqlOptions.Host },
                { "Database", _sqlOptions.Database },
                { "Username", _sqlOptions.Username },
                { "Password", _sqlOptions.Password }, 
                { "Schema", _sqlOptions.Schema },
                { "Port", _sqlOptions.Port },
                { "FilterTables", filterTables }
            };

            return new RVUserContext(userId, props);
        }
    }
}