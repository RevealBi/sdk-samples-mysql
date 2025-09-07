package com.server.reveal;

public class DashboardNameInfo {
    private String dashboardFileName;
    private String dashboardTitle;

    public DashboardNameInfo(String dashboardFileName, String dashboardTitle) {
        this.dashboardFileName = dashboardFileName;
        this.dashboardTitle = dashboardTitle;
    }

    public String getDashboardFileName() {
        return dashboardFileName;
    }

    public void setDashboardFileName(String dashboardFileName) {
        this.dashboardFileName = dashboardFileName;
    }

    public String getDashboardTitle() {
        return dashboardTitle;
    }

    public void setDashboardTitle(String dashboardTitle) {
        this.dashboardTitle = dashboardTitle;
    }

    @Override
    public String toString() {
        return "DashboardNameInfo [dashboardFileName=" + dashboardFileName + ", dashboardTitle=" + dashboardTitle + "]";
    }
}