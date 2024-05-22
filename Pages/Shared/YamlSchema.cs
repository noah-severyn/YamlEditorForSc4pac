using System.Text.Json;
using System.Text.Json.Nodes;
using YamlDotNet;
using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization;
using System.Text.RegularExpressions;
using System.Xml;
using static System.Net.Mime.MediaTypeNames;


namespace SC4PackMan.Pages.Shared {
    public enum YamlErrorType {
        Warning = 0,
        Error = 1
    }
    public struct YamlError {
        public YamlErrorType ErrorType { get; set; }
        public int LineNumber { get; set; }
        public string Message { get; set; }

        internal YamlError(YamlErrorType errorType, int line, string msg)  {
            ErrorType = errorType;
            LineNumber = line;
            Message = msg;
        }

        public override string ToString() {
            return $"{ErrorType}: ({LineNumber}) {Message}";
        }
    }


    public static class YamlSchema {
        public static List<string> Subfolders = new List<string> {
                "050-early-mods",
                "100-props-textures",
                "150-mods",
                "170-terrain",
                "180-flora",
                "200-residential",
                "300-commercial",
                "360-landmark",
                "400-industrial",
                "410-agriculture",
                "500-utilities",
                "600-civics",
                "610-safety",
                "620-education",
                "630-health",
                "640-government",
                "650-religion",
                "660-parks",
                "700-transit",
                "900-overrides"
            };



        public static List<YamlError> ValidateYaml(string yamlText) {
            //string test1 = "group: \"aqua877\"\r\nname: \"jrs-prop-pack-signs\"\r\nversion: \"1\"\r\nsubfolder: \"100-props-textures\"\r\nassets:\r\n- assetId: \"aqua-877-jrs-prop-pack-signs\"\r\ninfo:\r\n  summary: \"Japanese Road-Sign props\"\r\n  author: \"aqua877\"\r\n  website: \"http://hide-inoki.com/bbs/archives/sc4_0721.html\"\r\n\r\n---\r\nassetId: \"aqua-877-jrs-prop-pack-signs\"\r\nversion: \"1\"\r\nlastModified: \"2020-08-26T12:37:13Z\"\r\nurl: \"http://hide-inoki.com/bbs/archives/files/1107.zip\"\r\n";
            //string test2 = File.ReadAllText("C:\\source\\repos\\sc4pac\\src\\yaml\\aqua877\\jrs-prop-pack.yaml");

            YamlError? error = ValidateDocumentSeparators(yamlText);

            //First form the document - this assumes the yaml is properly formed already
            YamlFile yaml = Deserialize(yamlText);

            //The idea is we want to fully deserialze the data even if there are error so we can show all errors at once isntead of multiple times
            List<YamlError> errors = yaml.Validate();


            return errors;
        }


        public static YamlFile Deserialize(string yamlText) {
            YamlFile yml = new YamlFile();
            var deserializer = new DeserializerBuilder().WithNamingConvention(CamelCaseNamingConvention.Instance).Build();
            string[] documents = yamlText.Split("---");

            foreach (string doc in documents) {
                if (doc.Contains("\nassetId:") && doc.Contains("\nurl:") && doc.Contains("\nversion:") && doc.Contains("\nlastModified:")) {
                    var a = deserializer.Deserialize<SC4PacAsset>(doc);
                    yml.Assets.Add(a);
                } else if (doc.Contains("group:") && doc.Contains("\nname:") && doc.Contains("\nversion:") && doc.Contains("\nsubfolder:")) {
                    var p = deserializer.Deserialize<SC4PacPackage>(doc);
                    yml.Packages.Add(p);
                }
            }
            return yml;
        }


        /// <summary>
        /// Validate that each of the keywords that start a package or asset definition is preceeded with the document separator.
        /// </summary>
        /// <param name="yamlText"></param>
        /// <returns></returns>
        private static YamlError? ValidateDocumentSeparators(string yamlText) {
            string[] lines = yamlText.Split('\n');
            for (int idx = 0; idx < lines.Length; idx++) {
                string line = lines[idx];
                if (line.StartsWith("group:") || line.StartsWith("url:") || line.StartsWith("\"group\":") || line.StartsWith("\"url\":")) {
                    if (idx > 0) {
                        string prevline = lines[idx - 1];
                        if (!prevline.StartsWith("---")) {
                            return new YamlError(YamlErrorType.Error, idx + 1, "YAML file contains multiple package and asset definitions. Each item must be separated with `---`.");
                        }
                    }
                }
            }
            return null;
        }

        

        public static bool IsValidUrl(string url) {
            return Uri.TryCreate(url, UriKind.Absolute, out Uri uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}
