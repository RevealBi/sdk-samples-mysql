using Reveal.Sdk;
using Reveal.Sdk.Data;
using Reveal.Sdk.Data.MySql;
using System.Text.RegularExpressions;

namespace RevealSdk.Server.Reveal
{
    internal class DataSourceProvider : IRVDataSourceProvider
    {
        /// <summary>
        /// Sanitizes a SQL parameter to prevent SQL injection attacks
        /// </summary>
        /// <param name="input">The raw user input to sanitize</param>
        /// <returns>A sanitized value safe to use in SQL queries</returns>
        private string SanitizeSqlParameter(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "NULL";

            // If input is numeric, return it directly
            if (int.TryParse(input, out _))
                return input;
                
            // For string values, escape single quotes and wrap in quotes
            string escaped = input.Replace("'", "''");
            
            // Remove any potentially harmful characters
            // Only allow alphanumeric, spaces, and some safe punctuation
            escaped = Regex.Replace(escaped, @"[^\w\s.,;:@\-]", "");
            
            return $"'{escaped}'";
        }
        public Task<RVDataSourceItem> ChangeDataSourceItemAsync(IRVUserContext userContext, string dashboardId, RVDataSourceItem dataSourceItem)
        {
            if (dataSourceItem is RVMySqlDataSourceItem sqlDsi)
            {
                ChangeDataSourceAsync(userContext, sqlDsi.DataSource);

                switch (sqlDsi.Id)
                {
                    // ****
                    // Example of an Stored Procedure with a customerId parameter from the userContext
                    // ****
                    case "sp_customer_orders":
                        sqlDsi.Procedure = "sp_customer_orders";
                        string sanitizedUserId = userContext.UserId?.ToString() ?? string.Empty;
                        if (string.IsNullOrWhiteSpace(sanitizedUserId) || !Regex.IsMatch(sanitizedUserId, @"^[\w\-]+$"))
                        {
                            sanitizedUserId = "0"; // Default to a safe value if invalid
                        }
                        
                        sqlDsi.ProcedureParameters = new Dictionary<string, object> { { "customer", sanitizedUserId } };
                        break;
                    // ****
                    // Example of an ad-hoc query with a customerId parameter from the userContext
                    // ****
                    case "customer_orders":
                        {
                            string tableName = "customer_orders"; 
                            string sanitizedCustomerId = SanitizeSqlParameter(userContext.UserId?.ToString() ?? string.Empty);                            
                            sqlDsi.CustomQuery = $"select * from {tableName} where customer_id = {sanitizedCustomerId}";
                        }
                        break;
                    // ****
                    // Example of a ad-hoc query to a View with a orderId parameter from the userContext
                    // ****
                    case "customer_orders_details":
                        {
                            string tableName = "customer_orders_details"; 
                            string sanitizedOrderId = SanitizeSqlParameter(userContext.Properties["OrderId"]?.ToString());                            
                            sqlDsi.CustomQuery = $"select * from {tableName} where order_id = {sanitizedOrderId}";
                        }
                        break;
                    // ****
                    // This assumes the Data Sources Dialog table / object is selected
                    // you can check the incoming request of function, table to customize the query
                    // ****
                    default:
                        if (sqlDsi.Table == "customers")
                        {
                            string tableName = "customers"; 
                            string? role = userContext.Properties["Role"]?.ToString();
                            
                            if (role == "Admin")
                            {
                                // Admin users see all records
                                sqlDsi.CustomQuery = $"select * from {tableName}";
                            }
                            else
                            {
                                string sanitizedCustomerIdInDefault = SanitizeSqlParameter(userContext.UserId?.ToString() ?? string.Empty);
                                sqlDsi.CustomQuery = $"select * from {tableName} where id = {sanitizedCustomerIdInDefault}";
                            }
                        }
                        break;
                }
            }
            return Task.FromResult(dataSourceItem);
        }

        public Task<RVDashboardDataSource> ChangeDataSourceAsync(IRVUserContext userContext, RVDashboardDataSource dataSource)
        {

            if (dataSource is RVMySqlDataSource sqlDs)
            {
                sqlDs.Host = userContext.Properties["Host"]?.ToString();
                sqlDs.Database = userContext.Properties["Database"]?.ToString();
            }
             return Task.FromResult(dataSource);
        }
    }
}