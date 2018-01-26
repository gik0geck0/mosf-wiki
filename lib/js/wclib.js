function loadCmp(cmpName) {
    return new Promise((resolve, reject) => {
        var link = document.createElement('link');
        link.setAttribute('rel', 'import');
        link.setAttribute('href', '/components/' + cmpName + '.html');
        link.onload = function() {
            resolve(cmpName);
        };
        document.body.appendChild(link);
    });
}

var URI = {
    getRelative(url) {
        var parser = document.createElement("a");
        parser.href = url;
        return parser.pathname + parser.search + parser.hash;
    }
};

const LINK_RE = new RegExp("/components/([^/\.]+)\.html");

window.$WC = {
    createComponent: function createComponent(cmpName, attributes) {
        var cmpNeedsLoad = ! $WC.isCmpLoaded(cmpName);

        var next = cmpNeedsLoad ? loadCmp(cmpName) : Promise.resolve();

        return next.then(() => {
            var e = document.createElement(cmpName);
            Object.keys(attributes).forEach((k) => {
                e.setAttribute(k, attributes[k]);
            });
            return e;
        });
    },

    isCmpLoaded: function isCmpLoaded(cmpName) {
        var allImports = document.querySelectorAll("link[rel='import']");
        if (allImports) {
            for (var i=0; i < allImports.length; i++) {
                var importLink = allImports[i];
                var relativeUri = URI.getRelative(importLink.getAttribute("href"));
                var matcher = LINK_RE.exec(relativeUri);
                if (matcher) {
                    if (matcher[1] === cmpName) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
};
