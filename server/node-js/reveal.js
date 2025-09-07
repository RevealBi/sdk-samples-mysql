var express = require('express');
var reveal = require('reveal-sdk-node');
var cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const dashboardDefaultDirectory = path.join(__dirname, 'Dashboards');

app.use(cors());

// Step 1 - Optional, userContext
const userContextProvider = (request) => {
  const headerValue = request.headers['x-header-one']; 
  
  let userId = null;
  let orderId = null;

  if (headerValue) {
      const pairs = headerValue.split(',');
      
      for (const pair of pairs) {
          const kv = pair.split(':');
          if (kv.length === 2) {
              const key = kv[0].trim().toLowerCase();
              const value = kv[1].trim();
              
              if (key === 'userid') {
                  userId = value || '11'; // Default to BLONP if value is empty
              } else if (key === 'orderid') {
                  orderId = value;
              }
          }
      }
  }
  
  // If no header or no userId found, default to 11
  if (!userId) {
      userId = '11';
  }
  
  var props = new Map();

  // Set userId and orderId in properties
  props.set("userId", userId);
  props.set("OrderId", orderId || "");
  
  // Default to User role
  let role = "User";
  
  // Only specific users get Admin role
  if (userId === "11") {
      role = "Admin";
  }

  // Set role in properties
  props.set("Role", role);
  
  // Set filterTables based on role
  const filterTables = role === "Admin" 
      ? [] 
      : ["customers", "orders", "order_details"];
  
  props.set("FilterTables", filterTables);
  
  // Set MySQL properties from .env file
  props.set("Host", process.env.HOST);
  props.set("Database", process.env.DATABASE);
  props.set("Username", process.env.MYSQL_USERNAME);
  props.set("Password", process.env.MYSQL_PASSWORD);
  props.set("Port", process.env.PORT);
    
  console.log("UserContext properties:", Object.fromEntries(props));
  return new reveal.RVUserContext(userId, props);
};

// Step 2 - Set up your Authentication Provider
const authenticationProvider = async (userContext, dataSource) => {
    if (dataSource instanceof reveal.RVMySqlDataSource) {
      const username = userContext.properties.get("Username");
      const password = userContext.properties.get("Password");
      console.log("MySQL Authentication - Username:", username);
      return new reveal.RVUsernamePasswordDataSourceCredential(username, password);
    }
}

// Step 3 - Set up your Data Source Provider
const dataSourceProvider = async (userContext, dataSource) => {
    if (dataSource instanceof reveal.RVMySqlDataSource) {
        const host = userContext.properties.get("Host");
        const database = userContext.properties.get("Database");
        
        dataSource.host = host;
        dataSource.database = database;
  }
  return dataSource;
}

// Step 4 - Set up your Data Source Item Provider
// Every request for data passes through dataSourceItemProvider
// You can set query properties based on the incoming requests
const dataSourceItemProvider = async (userContext, dataSourceItem) => {
    try {
        // Only process MySQL data source items
        if (!(dataSourceItem instanceof reveal.RVMySqlDataSourceItem)) {
            return dataSourceItem;
        }

        // Ensure data source is updated with userContext
        await dataSourceProvider(userContext, dataSourceItem.dataSource);

        // Get the UserContext properties
        const userId = userContext.userId;

        // Set custom queries or stored procedures based on the dataSourceItem ID
        switch (dataSourceItem.id) {
            // Example of a simple custom query
            case "customer_orders":
                dataSourceItem.customQuery = "SELECT * FROM northwind.customer_orders";
                break;
            
            // Example of how to use an ad-hoc query with a parameter
            case "customer_orders_details":
                const customQuery = `SELECT * FROM northwind.customer_orders_details WHERE customer_id = '${userId}'`;
                console.log("Query: " + customQuery);
                dataSourceItem.customQuery = customQuery;
                break;
            
            // Example of how to use a stored procedure with a parameter
            case "sp_customer_orders":
                dataSourceItem.procedure = "sp_customer_orders";
                dataSourceItem.procedureParameters = { "customer": userId };
                break;
        }

        return dataSourceItem;
    } catch (error) {
        console.error('ERROR in DataSourceItemProvider:', error);
        return dataSourceItem;
    }
};

// DashboardProvider - matches TypeScript implementation
const dashboardProvider = async (userContext, dashboardId) => {
    try {
        const filePath = path.join(dashboardDefaultDirectory, `${dashboardId}.rdash`);
        
        if (fs.existsSync(filePath)) {
            const stream = fs.createReadStream(filePath);
            return stream;
        } else {
            throw new Error(`Dashboard file not found: ${filePath}`);
        }
    } catch (error) {
        console.error('ERROR in DashboardProvider:', error);
        throw error;
    }
};

// DashboardStorageProvider - matches TypeScript implementation  
const dashboardStorageProvider = async (userContext, dashboardId, stream) => {
    try {
        const userId = userContext?.properties?.userId || userContext?.userId;
        
        let savePath;
        
        if (userId === 'ALFKI') {
            savePath = path.join(dashboardDefaultDirectory, `${dashboardId}.rdash`);
        } else {
            savePath = path.join(dashboardDefaultDirectory, `${dashboardId}.rdash`);
        }
        
        await pipelineAsync(stream, fs.createWriteStream(savePath));
    } catch (error) {
        console.error('ERROR in DashboardStorageProvider:', error);
        throw error;
    }
};


// DataSourceItemFilter - simplified version
const dataSourceItemFilter = async (userContext, item) => {
    if (!(item instanceof reveal.RVMySqlDataSourceItem || item instanceof reveal.RVMySqlDataSourceItem)) {
        return false;
    }
    
    const role = userContext?.properties?.get("Role") || "User";
    
    // // Admin can see all tables
    if (role === "Admin") {
        return true;
    }
    
    // Non-admin can only see tables in filterTables
    const filterTables = userContext?.properties?.get("FilterTables") || [];
    const tableName = item.table?.toLowerCase();
    
    return filterTables.some(filterTable => 
        tableName === filterTable.toLowerCase() || 
        tableName?.endsWith('.' + filterTable.toLowerCase())
    );
};

// Final Step - Set up your Reveal Options
const revealOptions = {
    userContextProvider: userContextProvider,
    authenticationProvider: authenticationProvider,
    dataSourceProvider: dataSourceProvider,
    dataSourceItemProvider: dataSourceItemProvider,
    dataSourceItemFilter: dataSourceItemFilter,
    // localFileStoragePath: "data",
    // settings: {
    //   maxInMemoryCells: 100000,
    //   maxTotalStringsSize: 10,
    //   licenseKey: "your_license_key_here"
    // }
}

// Export the middleware for reveal
module.exports = reveal(revealOptions);