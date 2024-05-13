using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SC4PackMan.Pages.Shared;

namespace SC4PackMan.Pages {
    public class IndexModel : PageModel {

        [BindProperty]
        public Package Package { get; set; }
        public string GeneratedYAML { get; set; }
        


        private readonly ILogger<IndexModel> _logger; 

        public IndexModel(ILogger<IndexModel> logger) {
            _logger = logger;
        }

        public void OnGet() {
            Package Package = new Package();
            

            //StringBuilder GeneratedYAML = new StringBuilder();
            //GeneratedYAML.AppendLine("group: #pkg.group#");
            //GeneratedYAML.AppendLine("name: #pkg.name#");
            //GeneratedYAML.AppendLine("version: #pkg.version#");
            //GeneratedYAML.AppendLine("subfolder: #pkg.subfolder#");
            //GeneratedYAML.AppendLine("dependencies: #pkg.dependencies#");
            //GeneratedYAML.AppendLine("assets: #pkg.assets#");
            //GeneratedYAML.AppendLine("include: #pkg.include#");
            //GeneratedYAML.AppendLine("exclude: #pkg.exclude#");
            //GeneratedYAML.AppendLine("info: #pkg.info#");
        }
    }
}
