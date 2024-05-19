using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SC4PackMan.Pages.Shared;

namespace SC4PackMan.Pages {
    public class IndexModel : PageModel {

        [BindProperty]
        public SC4PacPackage Package { get; set; }
        public string GeneratedYAML { get; set; }
        public List<YamlError> Errors { get; set; }


        private readonly ILogger<IndexModel> _logger; 

        public IndexModel(ILogger<IndexModel> logger) {
            _logger = logger;
        }

        public void OnGet() {
            SC4PacPackage Package = new SC4PacPackage();


            YamlSchema.ValidateYaml();
        }

        
        
    }
}
