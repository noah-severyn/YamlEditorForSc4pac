using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SC4PackMan.Pages.Shared;

namespace SC4PackMan.Pages {
    public class IndexModel : PageModel {

        [BindProperty]
        public Package Package { get; set; }
        public StringBuilder GeneratedYAML { get; set; }
        


        private readonly ILogger<IndexModel> _logger; 

        public IndexModel(ILogger<IndexModel> logger) {
            _logger = logger;
        }

        public void OnGet() {
            Package Package = new Package();
            StringBuilder GeneratedYAML = new StringBuilder();

        }
    }
}
