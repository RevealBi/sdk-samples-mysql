using Reveal.Sdk;
using Reveal.Sdk.Data;
using Reveal.Sdk.Data.MySql;

namespace RevealSdk.Server.Reveal
{
    public class AuthenticationProvider : IRVAuthenticationProvider
    {
        public Task<IRVDataSourceCredential> ResolveCredentialsAsync(IRVUserContext userContext,
            RVDashboardDataSource dataSource)
        {        
            IRVDataSourceCredential userCredential = new RVIntegratedAuthenticationCredential();
            
            if (dataSource is RVMySqlDataSource)
            {
               var userName = userContext.Properties["Username"]?.ToString();
               var password = userContext.Properties["Password"]?.ToString();

                userCredential = new RVUsernamePasswordDataSourceCredential(userName, password);
            }
            return Task.FromResult(userCredential);
        }
    }
}