package com.server.reveal;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.IRVDashboardProvider;

    // ****
    // https://help.revealbi.io/web/saving-dashboards/#example-implementing-save-with-irvdashboardprovider
    // The Dashboard Provider is optional.  By default, Reveal Loads & Saves dashboards to the /dashboards folder
    // Use this provider to customize your Load / Save locations, like an alternate folder on the file system
    // or to a database.  Use the UserContext information to determine the user, or other properties, that dictates 
    // where you need to load / save your requested dashboards
    // ****


    // ****
    // NOTE:  This is ignored of it is not set in the Builder in RevealJerseyConfig.java --> .setDashboardProvider(new RevealDashboardProvider())
    // ****

import org.springframework.stereotype.Component;

@Component
public class RevealDashboardProvider implements IRVDashboardProvider {

    @Override
    public InputStream getDashboard(IRVUserContext userContext, String dashboardId) throws IOException {
        InputStream dashboardStream = new FileInputStream("dashboards/" + dashboardId + ".rdash");
        return dashboardStream;
    }

    @Override
    public void saveDashboard(IRVUserContext userContext, String dashboardId, InputStream dashboardStream) throws IOException {
        String filePath = System.getProperty("user.dir") + "/dashboards/" + dashboardId + ".rdash";
        System.out.println("Saving file to: " + filePath);
       Files.copy(dashboardStream, Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING); 
    }	
}