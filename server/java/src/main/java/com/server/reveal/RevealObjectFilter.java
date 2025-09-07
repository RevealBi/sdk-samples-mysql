package com.server.reveal;

import java.util.Arrays;

import com.infragistics.reveal.sdk.api.IRVObjectFilter;
import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.model.RVDashboardDataSource;
import com.infragistics.reveal.sdk.api.model.RVDataSourceItem;
import com.infragistics.reveal.sdk.api.model.RVMySqlDataSource;
import com.infragistics.reveal.sdk.api.model.RVMySqlDataSourceItem;

    // ****
    // https://help.revealbi.io/web/user-context/#using-the-user-context-in-the-objectfilterprovider
    // ObjectFilter Provider is optional.
    // The Filter functions allow you to control the data sources dialog  on the client.
    // ****


    // ****
    // NOTE:  This is ignored of it is not set in the Builder in RevealJerseyConfig.java --> setObjectFilter(new RevealObjectFilter())
    // ****

import org.springframework.stereotype.Component;

@Component
public class RevealObjectFilter implements IRVObjectFilter {
    
    @Override
    public boolean filter(IRVUserContext userContext, RVDashboardDataSource dataSource) {
        
        // ****
        // In the scenario I only want the northwind database to be displayed in the Data Sources. 
        // ****
        
        String[] allowedList = { "northwind" }; 
        if (dataSource != null)
        {
            if (dataSource instanceof RVMySqlDataSource dataSQL) 
            {
                if (Arrays.asList(allowedList).contains(dataSQL.getDatabase())) {
                    return true;
                }
            }
        }
        return false; 
    }

    @Override
    public boolean filter(IRVUserContext userContext, RVDataSourceItem dataSourceItem) {
        if (userContext != null && userContext.getProperties() != null && 
            dataSourceItem instanceof RVMySqlDataSourceItem) {
            
            RVMySqlDataSourceItem dataSQLItem = (RVMySqlDataSourceItem) dataSourceItem;
            
            Object filterTablesObj = userContext.getProperties().get("FilterTables");
            if (filterTablesObj instanceof String[]) {
                String[] filterTables = (String[]) filterTablesObj;
                
                // If filterTables is empty, allow all
                if (filterTables.length == 0) {
                    return true;
                }
                
                // Otherwise, restrict to allowed tables/procedures
                if ((dataSQLItem.getTable() != null && !Arrays.asList(filterTables).contains(dataSQLItem.getTable().toLowerCase())) ||
                    (dataSQLItem.getProcedure() != null && !Arrays.asList(filterTables).contains(dataSQLItem.getProcedure().toLowerCase()))) {
                    return false;
                }
            }
        }
        return true;
    }
    
    
}