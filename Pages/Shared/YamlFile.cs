using System.Collections.Generic;
using System.Runtime.Intrinsics.Arm;
using System.Text.RegularExpressions;

namespace SC4PackMan.Pages.Shared {
    public class YamlFile {

        public List<SC4PacPackage> Packages { get; set; }
        public List<SC4PacAsset> Assets { get; set; }

        public YamlFile() {
            Packages = new List<SC4PacPackage>();
            Assets = new List<SC4PacAsset>();
        }


        public List<YamlError> Validate() {
            List <YamlError> errors = new List <YamlError>();
            Regex rgxHyphenatedAlphanumeric = new Regex("[^a-zA-Z\\d-]");
            Regex rgxUniqueIdentifier = new Regex("[^a-zA-Z\\d-:]");
            Regex rgxISO8601 = new Regex("(\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d)(Z|-\\d\\d:\\d\\d)");

            //Validate Packages
            foreach (SC4PacPackage pkg in Packages) {
                //Group
                if (pkg.Group is null || pkg.Group == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Group cannot be blank."));
                } else if (rgxHyphenatedAlphanumeric.Count(pkg.Group) > 0) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Group contains invalid characters. Only letters, numbers, and hyphens are permitted. No special characters."));
                }

                //Name
                if (pkg.Name is null || pkg.Name == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Name cannot be blank."));
                } else if (rgxHyphenatedAlphanumeric.Count(pkg.Name) > 0) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Name contains invalid characters. Only letters, numbers, and hyphens are permitted. No special characters."));
                } else if (pkg.Name.Contains(pkg.Group)) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "The Group should not be included in the Name."));
                } else if (pkg.Name.Length > 50) {
                    errors.Add(new YamlError(YamlErrorType.Warning, 0, "Name is longer than 50 characters. Consider shortening."));
                }

                //Version
                if (pkg.Version is null || pkg.Version == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Version cannot be blank."));
                }

                //Subfolder
                if (pkg.Subfolder is null || pkg.Subfolder == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Subfolder cannot be blank."));
                } else if (!YamlSchema.Subfolders.Contains(pkg.Subfolder)) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Subfolder is not valid."));
                }

                //Dependencies
                if (pkg.Dependencies is not null) {
                    foreach (string dep in pkg.Dependencies) {
                        if (rgxUniqueIdentifier.Count(dep) > 0) {
                            errors.Add(new YamlError(YamlErrorType.Error, 0, "Dependency format is not valid."));
                        }
                        //TODO - validate for found packages
                    }
                }

                //Assets
                if (pkg.Assets is not null) {
                    foreach (SC4PacPackage.AssetDetails assetInfo in pkg.Assets) {
                        if (rgxUniqueIdentifier.Count(assetInfo.AssetId) > 0) {
                            errors.Add(new YamlError(YamlErrorType.Error, 0, "AssetId format is not valid."));
                        }
                        //TODO - validate for found assets

                        //Include
                        if (assetInfo.Include is not null) {
                            foreach (string incl in assetInfo.Include) {
                                //Check for file/folder names; if not a file or folder then regex is presumed
                                if (incl.First() == '/' && incl.IndexOfAny(Path.GetInvalidPathChars()) > 0) {
                                    errors.Add(new YamlError(YamlErrorType.Error, 0, "File or folder format is not valid."));
                                } else {
                                    try {
                                        Regex rgx = new Regex(incl);
                                        rgx.Count("test string");
                                    }
                                    catch (ArgumentException) {
                                        errors.Add(new YamlError(YamlErrorType.Error, 0, $"Regex `{incl}` is not valid."));
                                    }
                                }
                            }
                        }

                        //Exclude
                        if (assetInfo.Exclude is not null) {
                            foreach (string excl in assetInfo.Exclude) {
                                //Check for file/folder names; if not a file or folder then regex is presumed
                                if (excl.First() == '/' && excl.IndexOfAny(Path.GetInvalidPathChars()) > 0) {
                                    errors.Add(new YamlError(YamlErrorType.Error, 0, "File or folder format is not valid."));
                                } else {
                                    try {
                                        Regex rgx = new Regex(excl);
                                        rgx.Count("test string");
                                    }
                                    catch (ArgumentException) {
                                        errors.Add(new YamlError(YamlErrorType.Error, 0, $"Regex `{excl}` is not valid."));
                                    }
                                }
                            }
                        }
                    }
                }

                //Info.Summary
                if (pkg.Info.Summary is null || pkg.Info.Summary == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Summary cannot be blank."));
                } else if (pkg.Info.Summary.Length > 50) {
                    errors.Add(new YamlError(YamlErrorType.Warning, 0, "Summary is longer than 50 characters. Consider shortening."));
                }
                //Info.Website
                if (pkg.Info.Website is null || pkg.Info.Website == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Website cannot be blank."));
                } else if (!YamlSchema.IsValidUrl(pkg.Info.Website)) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Website is not a valid URL format."));
                }

                //Info.Images
                if (pkg.Info.Images is not null) {
                    foreach (string img in pkg.Info.Images) {
                        if (!YamlSchema.IsValidUrl(img)) {
                            errors.Add(new YamlError(YamlErrorType.Error, 0, "Image URL is not a valid format."));
                        }
                    }
                }

                //No validation for Warning, Conflicts, Description, or Author as those can be pretty much any text
            }


            //Validate Assets
            foreach (SC4PacAsset ast in Assets) {
                //Url
                if (ast.Url is null || ast.Url == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Url cannot be blank."));
                } else if (!YamlSchema.IsValidUrl(ast.Url)) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Url is not a valid URL format."));
                } else if (ast.Url.Contains('&')) {
                    errors.Add(new YamlError(YamlErrorType.Warning, 0, "Unnecessary query parameters shoud be removed."));
                }

                //AssetId
                if (ast.AssetId is null || ast.AssetId == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "AssetID cannot be blank."));
                } else if (rgxHyphenatedAlphanumeric.Count(ast.AssetId) > 0) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "AssetID contains invalid characters. Only letters, numbers, and hyphens are permitted. No special characters."));
                }

                //Version
                if (ast.Version is null || ast.Version == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "Version cannot be blank."));
                }

                //Last Modified
                if (ast.LastModified is null || ast.LastModified == "") {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "LastModified cannot be blank."));
                } else if (!DateTime.TryParse(ast.LastModified, out _)) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "LastModified is not a valid datetime."));
                } else if (rgxISO8601.Count(ast.LastModified) == 0) {
                    errors.Add(new YamlError(YamlErrorType.Error, 0, "LastModified is not a valid datetime format. It must be \"1998-07-29T21:33:57Z\" or \"1998-07-29T13:33:57-08:00\"."));
                }


            }

            return errors;
        }
    }
}
