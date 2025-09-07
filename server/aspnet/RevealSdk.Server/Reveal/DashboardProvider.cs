using Reveal.Sdk;

namespace RevealSdk.Server.Reveal
{
    // ****
    // https://help.revealbi.io/web/saving-dashboards/#example-implementing-save-with-irvdashboardprovider
    // ****
    // NOTE:  This is ignored of it is not set in the Builder in Program.cs --> //.AddDashboardProvider<DashboardProvider>()
    // ****
    public class DashboardProvider : IRVDashboardProvider
    {
        public Task<Dashboard> GetDashboardAsync(IRVUserContext userContext, string dashboardId)
        {
            // Only load dashboards from the MyDashboards folder
            var filePath = Path.Combine(Environment.CurrentDirectory, $"MyDashboards/{dashboardId}.rdash");
            var dashboard = new Dashboard(filePath);
            return Task.FromResult(dashboard);
        }

        public async Task SaveDashboardAsync(IRVUserContext userContext, string dashboardId, Dashboard dashboard)
        {
            // Only save dashboards to the MyDashboards folder.
            var filePath = Path.Combine(Environment.CurrentDirectory, $"MyDashboards/{dashboardId}.rdash");
            await dashboard.SaveToFileAsync(filePath);
        }
    }
}
