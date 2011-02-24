/********************************
 * jQuery XML Helper
 * 
 * Created by Kamran Ayub (c)2011
 * https://github.com/kamranayub/jQuery-XML-Helper
 *
 * Makes working with XML using jQuery a bit easier
 * for Internet Explorer.
 *
 *
 */
 var $$ = $.sub();
 
$.xml = function (xml) {
    /// <summary>
    /// Makes working with XML a little more
    /// cross-browser compatible by overloading
	/// and extending some core jQuery functions
    /// </summary>

    "use strict";    
    	
	$$.parseXML = function (data, xml, tmp) {
		// Slightly modified to use
		// ActiveX for IE9 as well (reversed
		// statements
		if ( window.ActiveXObject ) { // IE6+
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		} else { // Standard						
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		}

		tmp = xml.documentElement;

		if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
			jQuery.error( "Invalid XML: " + data );
		}

		return xml;
	};
	
	$$.fn.append = function () {
		var target = arguments[0],
			nodes = [],
			numNodes;
		
		if (this[0] !== null && $.find.isXML(this[0])) {
			// XMLDOM?			
			if ($.find.isXML(target)) {		
                //console.log("Appending XMLDOM", target);
				nodes = target.childNodes;
			// $-wrapped XML?
			} else if (target instanceof $ && $.find.isXML(target[0])) {
                //console.log("Appending $XML", target);
				nodes = target;
			// String?
			} else if (typeof target === "string") {
                //console.log("Appending string");
				// Wrap in case multiple elements were requested
				nodes = $$.parseXML("<jxmlroot>" + target + "</jxmlroot>").firstChild.childNodes;
            }
			
			// Nodes get removed from array when moved
			numNodes = nodes.length;
			for (i = 0; i < numNodes; i++) {
				//console.log(this[0], nodes[0]);
				this[0].appendChild(nodes[0]);
			}
			
			return this;
		} else {
			return $.fn.append.apply(this, arguments);
		}
	};
    
    $$.fn.text = function () {
        var text = arguments[0],
            curDOM = this[0],
            textNode;
        
        if (text) {            
            textNode = curDOM.ownerDocument.createTextNode(text);
            
            curDOM.selectNodes("*").removeAll();
            curDOM.appendChild(textNode);
            
        } else {
            return $.fn.text.apply(this, arguments);
        }
    };
    
    $$.fn.cdata = function (data) {
        var curDOM = this[0], i, node, cdata;
        
        // Set CDATA
        if (data) {
            cdata = curDOM.ownerDocument.createCDATASection(data);
            
            // Remove existing CDATA, if any.
            for (i = 0; i < curDOM.childNodes.length; i++) {
                node = curDOM.childNodes[i];
                if (node.nodeType === 4) { // cdata
                    node.parentNode.removeChild(node);
                    break;
                }
            }
            
            curDOM.appendChild(cdata);
        } else {
            // Get CDATA
            for (i = 0; i < curDOM.childNodes.length; i++) {
                if (curDOM.childNodes[i].nodeType === 4) { // cdata
                    return curDOM.childNodes[i].nodeValue;
                }
            }
        }
        
        return null;
    };
    
    $$.fn.html = function () {
        // Redirect HTML w/ no args to .cdata()
        if (!arguments[0]) {
            return this.cdata();
        } else {
            return $.fn.html.apply(this, arguments);
        }
    };
	
	$$.fn.xml = function () {
		/// <summary>
		/// Gets outer XML. Expects $-wrapped XMLDOM.
		/// </summary>
        
		// for IE 
		if (window.ActiveXObject) {
			return this[0].xml;
		} else {
			// code for Mozilla, Firefox, Opera, etc.
		   return (new XMLSerializer()).serializeToString(this[0]);
		}
	};
    
    // Wrap in root tag so when creating new standalone markup, things
    // should still work.
    var parser = $$.parseXML("<jxmlroot>" + xml + "</jxmlroot>");
    
    return $$(parser).find("jxmlroot > *");
};