package com.server.reveal;
import com.infragistics.reveal.sdk.api.IRVAuthenticationProvider;
import com.infragistics.reveal.sdk.api.IRVDataSourceCredential;
import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.RVUsernamePasswordDataSourceCredential;
import com.infragistics.reveal.sdk.api.model.RVDashboardDataSource;
import com.infragistics.reveal.sdk.api.model.RVMySqlDataSource;

// ****
// https://help.revealbi.io/web/authentication/ 
// The Authentication Provider is required to set the credentials used
// in the DataSourceProvider changeDataSourceAsync to authenticate to your database
// ****

// ****
// NOTE:  This must beset in the Builder in RevealJerseyConfig.java --> .setAuthProvider(new AuthenticationProvider())
// ****

import org.springframework.stereotype.Component;

@Component
public class AuthenticationProvider implements IRVAuthenticationProvider {
    @Override
    public IRVDataSourceCredential resolveCredentials(IRVUserContext userContext, RVDashboardDataSource dataSource) {
        System.out.println(">>> AuthenticationProvider.resolveCredentials method was called <<<");
        
        // Check that the incoming request is for the expected data source type
        // You can check the data source type, or any of the information in your UserContext to
        // set credentials
        if (dataSource instanceof RVMySqlDataSource) {
            System.out.println(">>> AuthenticationProvider: Got MySQL data source <<<");
            
            // Log all properties from UserContext
            System.out.println(">>> UserContext properties in AuthenticationProvider <<<");
            userContext.getProperties().forEach((key, value) -> {
                if (key.equals("Password")) {
                    System.out.println(key + ": ********");
                } else {
                    System.out.println(key + ": " + value);
                }
            });

            // Get MySQL credentials from UserContext properties
            // These properties were set in UserContextProvider
            String username = (String)userContext.getProperties().get("Username");
            String password = (String)userContext.getProperties().get("Password");
            
            System.out.println("Username from UserContext: " + username);
            System.out.println("Password from UserContext: " + (password != null ? "********" : "<not set>"));
            
            // Use credentials from UserContext or fall back to defaults if not available
            return new RVUsernamePasswordDataSourceCredential(
                username != null ? username : "demouser", 
                password != null ? password : "demopass");
        }
        return null;
    }
}