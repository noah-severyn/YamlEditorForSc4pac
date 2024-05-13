namespace SC4PackMan.Pages.Shared {
    public static class Extensions {
        public static string ToYAMLString<T>(this List<T> list) {
            string output = "\r\n";
            foreach (T item in list) {
                output = output + "- " + item + "\r\n";
            }
            return output;
        }
    }
}
