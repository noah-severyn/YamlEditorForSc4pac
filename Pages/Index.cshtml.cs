using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SC4PackMan.Pages.Shared;

namespace SC4PackMan.Pages {
    public class IndexModel : PageModel {
        public List<YamlError> Errors { get; set; }
        public string YamlText { get; set; }
        private readonly ILogger<IndexModel> _logger; 

        public IndexModel(ILogger<IndexModel> logger) {
            Errors = new List<YamlError>();
            _logger = logger;
        }

        public void OnGet() {
            SC4PacPackage Package = new SC4PacPackage();

            

            //Errors = YamlSchema.ValidateYaml();
        }

        public void ValidateYaml(string yamlText) {
            Errors = YamlSchema.ValidateYaml(yamlText);
        }


    }
}
