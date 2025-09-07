package com.server.reveal;
import com.infragistics.reveal.sdk.api.IRVDataSourceProvider;
import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.model.*;
import java.util.HashMap;


// ****
// https://help.revealbi.io/web/datasources/
// https://help.revealbi.io/web/adding-data-sources/mysql/       
// The DataSource Provider is required.  
// Set you connection details in the ChangeDataSource, like Host & Database.  
// If you are using data source items on the client, or you need to set specific queries based 
// on incoming table requests, you will handle those requests in the ChangeDataSourceItem.
// ****

// ****
// NOTE:  This must beset in the Builder in RevealJerseyConfig.java --> .setDataSourceProvider(new DataSourceProvider())
// ****
import org.springframework.stereotype.Component;

@Component
public class DataSourceProvider implements IRVDataSourceProvider {
    
    // ****
    // Every request for data passes thru changeDataSourceItem
    // You can set query properties based on the incoming requests
    // ****
    public RVDataSourceItem changeDataSourceItem(IRVUserContext userContext, String dashboardsID, RVDataSourceItem dataSourceItem) {
        
        // Set custom queries or stored procedures based on the dataSourceItem ID
        if (dataSourceItem instanceof RVMySqlDataSourceItem sqlServerDsi) {
            
            // Ensure data source is updated
            changeDataSource(userContext, dataSourceItem.getDataSource());
            
            switch (sqlServerDsi.getId()) {
                case "customer_orders":
                    sqlServerDsi.setCustomQuery("SELECT * FROM northwind.customer_orders");
                    break;
                
                // *****
                // Example of how to use an ad-hoc query with a parameter
                // *****
                case "customer_orders_details":
                    String userId = userContext.getUserId();
                    String customQuery = "SELECT * FROM northwind.customer_orders_details WHERE customer_id = '" + userId + "'";

                    System.out.println("Query: " + customQuery);

                    sqlServerDsi.setCustomQuery(customQuery);
                    break;
                
                // *****
                // Example of how to use a stored procedure with a parameter
                // *****
                case "sp_customer_orders":
                    sqlServerDsi.setProcedure("sp_customer_orders");
                    HashMap<String, Object> procedureParameters = new HashMap<>();
                    procedureParameters.put("customer", userContext.getUserId());
                    sqlServerDsi.setProcedureParameters(procedureParameters);
                    break;
                }   
            }
        return dataSourceItem;
    }

    public RVDashboardDataSource changeDataSource(IRVUserContext userContext, RVDashboardDataSource dataSource) 
    {
        // *****
        // Check the request for the incoming data source
        // In a multi-tenant environment, you can use the user context properties to determine who is logged in
        // and what their connection information should be
        // you can also check the incoming dataSource type or id to set connection properties
        // *****
        if (dataSource instanceof RVMySqlDataSource mySqlServerDataSource) {
            // Use the database connection properties from UserContext
            mySqlServerDataSource.setHost((String)userContext.getProperties().get("Host"));
            mySqlServerDataSource.setDatabase((String)userContext.getProperties().get("Database")); 
        }
        return dataSource;
    }
}