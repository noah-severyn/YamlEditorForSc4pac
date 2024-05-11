using System.ComponentModel.DataAnnotations;
using static SC4PackMan.Pages.IndexModel;

namespace SC4PackMan.Pages.Shared {
    public class Package {
        /// <summary>
        /// Package owner, modding group or similar.
        /// </summary>
        public string Group { get; set; }
        /// <summary>
        /// The name of the package, unique within the group.
        /// </summary> 
        public string Name { get; set; }
        /// <summary>
        /// The version string should be chosen in line with the version of the main asset. It should be incremented whenever changes are made that make it necessary to reinstall the package.
        /// </summary>
        public string Version { get; set; }
        /// <summary>
        /// The folder inside the Plugins folder into which the package is installed. 3-digit numbers are used to control load order.
        /// </summary>
        public string Subfolder { get; set; }
        /// <summary>
        /// Optional list of package identifiers (zero or more) that are required for this package.
        /// </summary>
        public List<string>? Dependencies { get; set; }
        /// <summary>
        /// Optional list of assets from which to extract files (zero or more).
        /// </summary>
        public List<string>? Assets { get; set; }
        /// <summary>
        /// Optional list of files to include if not all of the files of an asset are needed.
        /// </summary>
        public List<string>? Include { get; set; }
        /// <summary>
        /// Optional list of files to exclude if not all of the files of an asset are needed.
        /// </summary>
        public List<string>? Exclude { get; set; }
        /// <summary>
        /// Additional descriptive information.
        /// </summary>
        public PackageInfo PackageInfo { get; set; }

        //public Package(string group, string name, string version, int subfolder, string summary, string website, List<string>? dependencies = null, List<string>? assets = null, List<string>? include = null, List<string>? exclude = null, string warning = "", string conflicts = "", string description = "", string author = "", List<string>? images = null) {
        //    Group = group;
        //    Name = name;
        //    Version = new Version(version);
        //    Subfolder = subfolder;
        //    Dependencies = dependencies ?? new List<string>();
        //    Assets = assets ?? new List<string>();
        //    Include = include ?? new List<string>();
        //    Exclude = exclude ?? new List<string>();
        //    PackageInfo = new PackageInfo(summary, website, warning, conflicts, description, author, images);
        //}
    }
}
