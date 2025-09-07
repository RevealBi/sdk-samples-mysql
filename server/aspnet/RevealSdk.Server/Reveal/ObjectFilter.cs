using Reveal.Sdk;
using Reveal.Sdk.Data;
using Reveal.Sdk.Data.MySql;

namespace RevealSdk.Server.Reveal
{
    // ****
    // https://help.revealbi.io/web/user-context/#using-the-user-context-in-the-objectfilterprovider
    // ****
    // NOTE:  This is ignored of it is not set in the Builder in Program.cs --> //.AddObjectFilter<ObjectFilterProvider>()
    // ****
    public class ObjectFilterProvider : IRVObjectFilter
    {
        public Task<bool> Filter(IRVUserContext userContext, RVDashboardDataSource dataSource) // this is a filter that goes through all databases on the server
        {
            // ****
            // To ensure there is no rogue request for a database that I don't want, you can 
            // use the Filter on the dataSource to validate only the database you expect is being accessed
            // is actually being accessed
            // ****
            var allowedList = new List<string>() { """northwind"""}; //here we indicate a list of databases with which we want to work

            if (dataSource != null)
            {
                if (dataSource is RVMySqlDataSource dataSQL) 
                {
                    if (allowedList.Contains(dataSQL.Database)) return Task.FromResult(true);
                }
            }
            return Task.FromResult(false);
        }

        public Task<bool> Filter(IRVUserContext userContext, RVDataSourceItem dataSourceItem)
        {
            // ****
            // In the scenario I am using the Roles that are set up in the UserContext Provider to check the 
            // Role property to restrict what is displayed in the Data Sources.
            // If the logged in user is an Admin role, they see all the Tables, Views, Sprocs, if not, 
            // they will only see the tables specified in FilterTables.
            // ****
            if (userContext?.Properties != null && dataSourceItem is RVMySqlDataSourceItem dataSQLItem)
            {
                if (userContext.Properties.TryGetValue("Role", out var roleObj) &&
                    roleObj?.ToString()?.ToLower() == "user")
                {
                    // Get the filtered tables from user context instead of hardcoding
                    if (userContext.Properties.TryGetValue("FilterTables", out var filterTablesObj) &&
                        filterTablesObj is string[] allowedItems)
                    {
                        var allowedItemsSet = new HashSet<string>(allowedItems);

                        if ((dataSQLItem.Table != null && !allowedItemsSet.Contains(dataSQLItem.Table)) ||
                            (dataSQLItem.Procedure != null && !allowedItemsSet.Contains(dataSQLItem.Procedure)))
                        {
                            return Task.FromResult(false);
                        }
                    }
                }
            }
            return Task.FromResult(true);
        }
    }
}
