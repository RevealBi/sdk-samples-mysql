import express, { Request, Response } from 'express';
import reveal, {
    IRVUserContext,
    RevealOptions,
    RVDashboardDataSource,
    RVDataSourceItem,
    RVMySqlDataSource,
    RVMySqlDataSourceItem,
    RVUserContext,
    RVUsernamePasswordDataSourceCredential
} from 'reveal-sdk-node';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { IncomingMessage } from 'http';
import { promisify } from 'util';
import { pipeline, Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const dashboardDefaultDirectory = path.join(process.cwd(), 'dashboards');
const pipelineAsync = promisify(pipeline);

app.use(cors());

// Step 0 - Create API to Retrieve Dashboards
app.get('/dashboards', (req: Request, res: Response) => {
  const directoryPath = './dashboards';
  fs.readdir(directoryPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      res.status(500).send({ error: 'Unable to scan directory' });
      return;
    }
    const fileNames = files.map((file: string) => {
      const { name } = path.parse(file);
      return { name };
    });
    res.send(fileNames);
  });
});

// Step 1 - Optional, userContext
const userContextProvider = (request: IncomingMessage): RVUserContext => {
  const headerValue = request.headers['x-header-one'] as string | undefined; 
  
  let userId: string | null = null;
  let orderId: string | null = null;

  if (headerValue) {
      const pairs = headerValue.split(',');
      
      for (const pair of pairs) {
          const kv = pair.split(':');
          if (kv.length === 2) {
              const key = kv[0].trim().toLowerCase();
              const value = kv[1].trim();
              
              if (key === 'userid') {
                  userId = value || '11'; // Default to 11 if value is empty
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
  
  const props = new Map<string, any>();

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
  return new RVUserContext(userId, props);
};

// Step 2 - Set up your Authentication Provider
const authenticationProvider = async (userContext: IRVUserContext | null, dataSource: RVDashboardDataSource) => {
    if (dataSource instanceof RVMySqlDataSource) {
      const username = userContext?.properties.get("Username") as string;
      const password = userContext?.properties.get("Password") as string;
      console.log("MySQL Authentication - Username:", username);
      return new RVUsernamePasswordDataSourceCredential(username, password);
    }
    return null;
};

// Step 3 - Set up your Data Source Provider
const dataSourceProvider = async (userContext: IRVUserContext | null, dataSource: RVDashboardDataSource) => {
    if (dataSource instanceof RVMySqlDataSource) {
        const host = userContext?.properties.get("Host") as string;
        const database = userContext?.properties.get("Database") as string;
        
        dataSource.host = host;
        dataSource.database = database;
  }
  return dataSource;
};

// Step 4 - Set up your Data Source Item Provider
// Every request for data passes through dataSourceItemProvider
// You can set query properties based on the incoming requests
const dataSourceItemProvider = async (userContext: IRVUserContext | null, dataSourceItem: RVDataSourceItem) => {
    try {
        // Only process MySQL data source items
        if (!(dataSourceItem instanceof RVMySqlDataSourceItem)) {
            return dataSourceItem;
        }

        // Ensure data source is updated with userContext
        await dataSourceProvider(userContext, dataSourceItem.dataSource);

        // Get the UserContext properties
        const userId = userContext?.userId;

        // Set custom queries or stored procedures based on the dataSourceItem ID
        switch (dataSourceItem.id) {
            // Example of a simple custom query
            case "customer_orders":
                (dataSourceItem as RVMySqlDataSourceItem).customQuery = "SELECT * FROM northwind.customer_orders";
                break;
            
            // Example of how to use an ad-hoc query with a parameter
            case "customer_orders_details":
                const customQuery = `SELECT * FROM northwind.customer_orders_details WHERE customer_id = '${userId}'`;
                console.log("Query: " + customQuery);
                (dataSourceItem as RVMySqlDataSourceItem).customQuery = customQuery;
                break;
            
            // Example of how to use a stored procedure with a parameter
            case "sp_customer_orders":
                (dataSourceItem as RVMySqlDataSourceItem).procedure = "sp_customer_orders";
                (dataSourceItem as RVMySqlDataSourceItem).procedureParameters = { "customer": userId };
                break;
        }

        return dataSourceItem;
    } catch (error) {
        console.error('ERROR in DataSourceItemProvider:', error);
        return dataSourceItem;
    }
};

// DashboardProvider - matches TypeScript implementation
const dashboardProvider = async (userContext: IRVUserContext | null, dashboardId: string) => {
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
const dashboardStorageProvider = async (userContext: IRVUserContext | null, dashboardId: string, stream: Readable) => {
    try {
        const userId = userContext?.properties?.get("userId") || userContext?.userId;
        
        let savePath: string;
        
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

// DataSourceItemFilter - more robust version
const dataSourceItemFilter = async (userContext: IRVUserContext | null, item: RVDataSourceItem): Promise<boolean> => {
    // First, check if this is a MySQL data source item
    if (!(item instanceof RVMySqlDataSourceItem)) {
        return false;
    }
    
    // Check for Admin role first - Admins can see everything
    const role = userContext?.properties?.get("Role") || "User";
    if (role === "Admin") {
        return true;
    }
    
    // Get filterTables from user context
    const filterTablesObj = userContext?.properties?.get("FilterTables");
    
    // Check if filterTables exists and is an array
    if (Array.isArray(filterTablesObj)) {
        // If filterTables is empty, allow all tables (no restrictions)
        if (filterTablesObj.length === 0) {
            return true;
        }
        
        // Convert everything to lowercase for case-insensitive comparison
        const filterTables = filterTablesObj.map(table => table.toLowerCase());
        
        // Check both table name and procedure name against allowed list
        const tableName = (item as RVMySqlDataSourceItem).table?.toLowerCase();
        const procedureName = (item as RVMySqlDataSourceItem).procedure?.toLowerCase();
        
        // Logic to check if the table or procedure is in the allowed list
        if (tableName) {
            // Check if table is directly in the list
            if (filterTables.includes(tableName)) {
                return true;
            }
            
            // Check if table with schema prefix is in the list
            const tableNameParts = tableName.split('.');
            if (tableNameParts.length > 1 && filterTables.includes(tableNameParts[tableNameParts.length - 1])) {
                return true;
            }
        }
        
        // Check if procedure is in the allowed list
        if (procedureName && filterTables.includes(procedureName)) {
            return true;
        }
        
        // If we get here, neither table nor procedure is in the allowed list
        return false;
    }
    
    // Default to false if filterTables isn't properly defined
    return false;
};

// Final Step - Set up your Reveal Options
const revealOptions: RevealOptions = {
    userContextProvider: userContextProvider,
    authenticationProvider: authenticationProvider,
    dataSourceProvider: dataSourceProvider,
    dataSourceItemProvider: dataSourceItemProvider,
    dataSourceItemFilter: dataSourceItemFilter,
    dashboardProvider: dashboardProvider,
    dashboardStorageProvider: dashboardStorageProvider
    // localFileStoragePath: "data",
    // settings: {
    //   maxInMemoryCells: 100000,
    //   maxTotalStringsSize: 10,
    //   licenseKey: "your_license_key_here"
    // }
};

// Export the middleware for reveal
export function createRevealMiddleware() {
    return reveal(revealOptions);
}
