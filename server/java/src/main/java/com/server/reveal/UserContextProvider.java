package com.server.reveal;

import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.base.RVUserContext;
import com.infragistics.reveal.sdk.rest.RVContainerRequestAwareUserContextProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import jakarta.ws.rs.container.ContainerRequestContext;

    // ****
    // https://help.revealbi.io/web/user-context/ 
    // The User Context is optional, but used in almost every scenario.
    // This accepts the HttpContext from the client, sent using the  $.ig.RevealSdkSettings.setAdditionalHeadersProvider(function (url).
    // UserContext is an object that can include the identity of the authenticated user of the application,
    // as well as other key information you might need to execute server requests in the context of a specific user.
    // The User Context can be used by Reveal SDK providers such as the
    // IRVDashboardProvider, IRVAuthenticationProvider, IRVDataSourceProvider
    // and others to restrict, or define, what permissions the user has.
    // ****


    // ****
    // NOTE:  This is ignored of it is not set in the Builder in RevealJerseyConfig.java -->  .setUserContextProvider(new UserContextProvider())
    // ****

@Component
public class UserContextProvider extends RVContainerRequestAwareUserContextProvider {
    
    public UserContextProvider() {
        System.out.println(">>> UserContextProvider constructor called - Bean is being created <<<");
    }
    
    // This method will be called by Spring after properties are set
    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println(">>> UserContextProvider properties initialized <<<");
        System.out.println("mysqlHost: " + mysqlHost);
        System.out.println("mysqlDatabase: " + mysqlDatabase);
        System.out.println("mysqlUsername: " + mysqlUsername);
        System.out.println("mysqlPassword: " + (mysqlPassword != null ? "********" : "<not set>"));
        System.out.println("mysqlSchema: " + mysqlSchema);
        System.out.println("mysqlPort: " + mysqlPort);
    }
    
    @Value("${mysql.host}")
    private String mysqlHost;
    
    @Value("${mysql.database}")
    private String mysqlDatabase;
    
    @Value("${mysql.username}")
    private String mysqlUsername;
    
    @Value("${mysql.password}")
    private String mysqlPassword;
    
    @Value("${mysql.schema}")
    private String mysqlSchema;
    
    @Value("${mysql.port}")
    private String mysqlPort;
    
    @Override
    protected IRVUserContext getUserContext(ContainerRequestContext requestContext) {
        System.out.println(">>> UserContextProvider.getUserContext method was called <<<");
        System.out.println(">>> Request headers: <<<");
        requestContext.getHeaders().forEach((key, values) -> {
            System.out.println(key + ": " + String.join(", ", values));
        });
        
        String headerValue = requestContext.getHeaderString("x-header-one");
        String userId = null;
        String orderId = null;

        if (headerValue != null && !headerValue.isEmpty()) {
            String[] pairs = headerValue.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2) {
                    String key = kv[0].trim();
                    String value = kv[1].trim();
                    if (key.equalsIgnoreCase("userId")) {
                        userId = value;
                    } else if (key.equalsIgnoreCase("orderId")) {
                        orderId = value;
                    }
                }
            }
        }

        // default to User role
        String role = "User";

        // null is used here just for demo 
        if ("11".equals(userId) || userId == null) {
            role = "Admin";
        }

        String[] filterTables = role.equals("Admin") 
            ? new String[0] 
            : new String[]{"customers", "orders", "order_details"};

        var props = new HashMap<String, Object>();
        props.put("OrderId", orderId != null ? orderId : "");
        props.put("Role", role);
        props.put("Host", mysqlHost);
        props.put("Database", mysqlDatabase);
        props.put("Username", mysqlUsername);
        props.put("Password", mysqlPassword);
        props.put("Schema", mysqlSchema);
        props.put("Port", mysqlPort);
        props.put("FilterTables", filterTables);
        
        // Log the properties being used
        System.out.println(">>> UserContextProvider properties used in context <<<");
        System.out.println("Host: " + props.get("Host"));
        System.out.println("Database: " + props.get("Database"));
        System.out.println("Username: " + props.get("Username"));
        System.out.println("Password: " + (props.get("Password") != null ? "********" : "<not set>"));
        System.out.println("Schema: " + props.get("Schema"));
        System.out.println("Port: " + props.get("Port"));

        // Log all properties to console for debugging
        System.out.println("=============== UserContext Properties ===============");
        System.out.println("UserId: " + userId);
        System.out.println("OrderId: " + (orderId != null ? orderId : "<not set>"));
        System.out.println("Role: " + role);
        System.out.println("Host: " + mysqlHost);
        System.out.println("Database: " + mysqlDatabase);
        System.out.println("Username: " + mysqlUsername);
        System.out.println("Password: " + (mysqlPassword != null ? "********" : "<not set>"));
        System.out.println("Schema: " + mysqlSchema);
        System.out.println("Port: " + mysqlPort);
        System.out.println("FilterTables: " + (filterTables.length == 0 ? "[]" : String.join(", ", filterTables)));
        System.out.println("====================================================");
        
        return new RVUserContext(userId, props); 
    }
}