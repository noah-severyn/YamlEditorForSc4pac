namespace SC4PackMan.Pages.Shared {
    /// <summary>
    /// An asset is usually a ZIP file that can be downloaded from the file exchanges. An asset cannot be installed directly by users of sc4pac, but it can provide files for one or multiple installable packages.
    /// </summary>
    public class Asset {
        /// <summary>
        /// This is the direct download link of the ZIP file hosted on a file exchange server. Get it from the Download button of the original upload.
        /// </summary>
        public string URL { get; set; }
        /// <summary>
        /// This is a unique identifier used internally by sc4pac and not visible to the user.
        /// </summary>
        public string AssetID {  get; set; }
        /// <summary>
        /// The version string should be identical to the one of the original upload. It is used for determining when an asset has changed, so packages using its files can be reinstalled.
        /// </summary>
        public Version Version { get; set; }
        /// <summary>
        /// The timestamp of the last-modification date of the upload.
        /// </summary>
        public DateTime LastModified { get; set; }
        /// <summary>
        /// Only needed for assets containing Clickteam exe-installers (in particular, not needed for NSIS exe-installers).
        /// </summary>
        public ArchiveType? ArchiveType { get; set; }

        public override string ToString() {
            return $"assetID: {AssetID}, version: {Version}, url: {URL}, lastModified:{LastModified}";
        }

        public string ToYAMLString() {
            return $"\r\n---\r\nassetID: \"{AssetID}\"\r\nurl: \"{URL}\"\r\nversion: \"{Version}\"\r\nlastModified:\"{LastModified}\"";
        }
    }


    public struct ArchiveType {

        public string Format { get; set; }
        /// <summary>
        /// The version number depends on the Clickteam version used when the installer was created. It must be set correctly or extraction would fail. Possible versions are 40, 35, 30, 24, 20
        /// </summary>
        public byte Version { get; set; }
    }

    
}
