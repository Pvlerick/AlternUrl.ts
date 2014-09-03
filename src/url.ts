module AlternUrl {
  export enum Kind {
    Absolute,
    Relative
  }

  export class Url {
    public scheme: string;
    public userinfo: string;
    public host: string;
    public port: number;
    public path: string;
    public query: string;
    public fragment: string;

    public kind: Kind;

    constructor(url: string) {
      //Parsing with regex from RFC 3986, Appendix B. - http://www.ietf.org/rfc/rfc3986.txt
      var matches = url.match(RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?"));

      this.scheme = matches[2];			
      this.path = matches[5];
      this.query = matches[7];
      this.fragment = matches[9];

      var authority = matches[4];

      //Kind of Url, just like in the .NET Framework
      if (this.scheme !== undefined || authority !== undefined) {
        //Absolute URL
        this.kind = Kind.Absolute;

        //Check if the Scheme is "illegal"
        if (this.scheme !== undefined && this.scheme.toUpperCase() != "HTTP" && this.scheme.toUpperCase() != "HTTPS") {					
          throw "Scheme has to be http or https for an absolute URL";
        }
        else {
          //Scheme is http or https
        }

        //Userinfo, host and port are found with further parsing of the authority
        var matches = authority.match(RegExp("(([^@]+)@)?([^:]+)(:(\\d+))?"));
        this.userinfo = matches[2];
        this.host = matches[3];
        this.port = +matches[5];
      }
      else {
        //Relative URL, nothing else to do
        this.kind = Kind.Relative;
      }
    }

    toString = function (): string {
      //First we need to rebuild the authority part
      var authority = "";
      if (this.userinfo !== undefined) authority += this.userinfo + "@";
      if (this.host !== undefined) authority += this.host;
      if (!isNaN(this.port)) authority += ":" + this.port;
      
      //Generating the URL string, following RFC 3986, 5.3 - http://www.ietf.org/rfc/rfc3986.txt
      var url = ""; 
      if (this.scheme !== undefined) url += this.scheme + ":";
      if (authority != "") url += "//" + authority;
      url += this.path;
      if (this.query !== undefined) url += "?" + this.query;
      if (this.fragment !== undefined) url += "#" + this.fragment;
      
      return url;
    }

    isHttps = function(): boolean {
      if (this.kind == Kind.Absolute) {
        return this.scheme == "https";
      }
      else {
        throw "Not supported for a relative URL";
      }
    }

    private buildDictionaryFromQuery = function(query: string) {
      var dict = {};
      
      var keyValues = this.query.split("&");
      for (var i = 0; i < keyValues.length; i++) {
        var keyValuePair = keyValues[i].split("=");
        dict[keyValuePair[0]] = keyValuePair[1];
      }
  
      return dict;
    }

    private buildQueryFromDictionary = function(dict: {}) {
      var query = "";
      
      for(var key in dict) {
        if(dict.hasOwnProperty(key)) {
          query += key + (dict[key] !== undefined ? "=" + dict[key] : "") + "&";
        }
      }
      
      return query.substr(0, query.length - 1);
    }

    hasParameter = function(param: string) : boolean {
      var dict = this.buildDictionaryFromQuery(this.query);
      return dict.hasOwnProperty(param); //Cannot simply check for undefined; case of parameter with no value
    }

    getParameter = function(param: string) : string {
      var dict = this.buildDictionaryFromQuery(this.query);
      return dict[param];
    }

    setParameter = function(param: string, value: string): Url {
      var dict = this.buildDictionaryFromQuery(this.query);
      dict[param] = value;
      this.query = this.buildQueryFromDictionary(dict);
      return this;
    }

    removeParameter = function(param: string) : Url {
      var dict = this.buildDictionaryFromQuery(this.query);
      delete dict[param];
      this.query = this.buildQueryFromDictionary(dict);
      return this;
    }
  }
}

var urlString = "http://stackoverflow.com:785/questions/3213531/creating-a-new-location-object-in-javascript/3213643?this=test&that=test_too&bleeh#3213643";

document.write("<strong>" + urlString + "</strong>");

var url = new AlternUrl.Url(urlString);

var writeTableRow = function(key: string, value: any) {
  document.write("<tr><td>" + key + "</td><td>" + value + "</td></tr>");
};

document.write("<table border='1'>")
writeTableRow("<strong>Parsing</strong>", "");
writeTableRow("Scheme", url.scheme);
writeTableRow("Userinfo", url.userinfo);
writeTableRow("Host", url.host);
writeTableRow("Port", url.port);
writeTableRow("Path", url.path);
writeTableRow("Query", url.query);
writeTableRow("Fragment", url.fragment);
writeTableRow("<strong>Properties</strong>", "");
writeTableRow("Kind", AlternUrl.Kind[url.kind]);
writeTableRow("<strong>Functions</strong>", "");
writeTableRow("isHttps", url.isHttps());
writeTableRow("hasParameter('this')", url.hasParameter("this"));
writeTableRow("hasParameter('that')", url.hasParameter("that"));
writeTableRow("hasParameter('bleeh')", url.hasParameter("bleeh"));
writeTableRow("hasParameter('foo')", url.hasParameter("foo"));
writeTableRow("getParameter('this')", url.getParameter("this"));
writeTableRow("getParameter('that')", url.getParameter("that"));
writeTableRow("getParameter('bleeh')", url.getParameter("bleeh"));
writeTableRow("getParameter('foo')", url.getParameter("foo"));
writeTableRow("toString()", url.toString());
document.write("</table>")
