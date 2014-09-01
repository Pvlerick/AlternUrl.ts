module AlternUrl {
    export enum Kind {
        Absolute,
        Relative
    }

    export class Url {
        public scheme: string;
        public host: string;
        public port: number;
        public path: string;
        public query: string;
        public fragment: string;

        public kind: Kind;

        constructor(url: string) {
            //Parsing with regex from RFC 3986, Appendix B. - http://www.ietf.org/rfc/rfc3986.txt
            var urlMatches = url.match(RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?"));

            this.scheme = urlMatches[2];
            this.path = urlMatches[5];
            this.query = urlMatches[6];
            this.fragment = urlMatches[8];

            var authority = urlMatches[4];

            //Kind of Url, just like in the .NET Framework
            if (this.scheme !== undefined || authority !== undefined) {
                //Absolute URL
                this.kind = Kind.Absolute;
                //Host and port are found with further parsing of the authority
                var authorityMatches = authority.match(RegExp("([^:]+)(:(\\d+))?"));
                this.host = authorityMatches[1];
                this.port = +authorityMatches[3];
            }
            else {
                //Relative URL, nothing else to do
                this.kind = Kind.Relative;
            }
        }

        toString = function (): string {
            //Generating the URL string, following RFC 3986, 5.3 - http://www.ietf.org/rfc/rfc3986.txt
            var url = "";

            if (this.scheme !== undefined) url += this.scheme + ":";
            if (this.host !== undefined) url += "//" + this.host;
            if (!isNaN(this.port)) url += ":" + this.port;
            url += this.path;
            if (this.query !== undefined) url += this.query;
            if (this.fragment !== undefined) url += this.fragment;

            return url;
        }
    }
}

var url = new AlternUrl.Url("http://stackoverflow.com:785/questions/3213531/creating-a-new-location-object-in-javascript/3213643?this=test#3213643");

document.write("Kind: " + AlternUrl.Kind[url.kind] + "<br />");
document.write("Scheme: " + url.scheme + "<br />");
document.write("Host: " + url.host + "<br />");
document.write("Port: " + url.port + "<br />");
document.write("Path: " + url.path + "<br />");
document.write("Query: " + url.query + "<br />");
document.write("Fragment: " + url.fragment + "<br />");

document.write("URL.toString(): " + url.toString() + "<br />");