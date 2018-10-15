(function(f,a){"function"==typeof define&&define.amd?define([],a):"object"==typeof exports?module.exports=a():f.download=a()})(this,function(){return function(f,a,b){function n(l){var a=l.split(/[:;,]/);l=a[1];var a=("base64"==a[2]?atob:decodeURIComponent)(a.pop()),c=a.length,b=0,d=new Uint8Array(c);for(b;b<c;++b)d[b]=a.charCodeAt(b);return new g([d],{type:l})}function k(a,b){if("download"in d)return d.href=a,d.setAttribute("download",m),d.innerHTML="downloading...",h.body.appendChild(d),setTimeout(function(){d.click(),h.body.removeChild(d),!0===b&&setTimeout(function(){e.URL.revokeObjectURL(d.href)},250)},66),!0;if("undefined"!=typeof safari)return a="data:"+a.replace(/^data:([\w\/\-\+]+)/,"application/octet-stream"),!window.open(a)&&confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")&&(location.href=a),!0;var c=h.createElement("iframe");h.body.appendChild(c),b||(a="data:"+a.replace(/^data:([\w\/\-\+]+)/,"application/octet-stream")),c.src=a,setTimeout(function(){h.body.removeChild(c)},333)}var e=window;b=b||"application/octet-stream";var c=f,h=document,d=h.createElement("a");f=function(a){return String(a)};var g=e.Blob||e.MozBlob||e.WebKitBlob||f,g=g.call?g.bind(e):Blob,m=a||"download";"true"===String(this)&&(c=[c,b],b=c[0],c=c[1]);if(String(c).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/))return navigator.msSaveBlob?navigator.msSaveBlob(n(c),m):k(c);a=c instanceof g?c:new g([c],{type:b});if(navigator.msSaveBlob)return navigator.msSaveBlob(a,m);if(e.URL)k(e.URL.createObjectURL(a),!0);else{if("string"==typeof a||a.constructor===f)try{return k("data:"+b+";base64,"+e.btoa(a))}catch(p){return k("data:"+b+","+encodeURIComponent(a))}b=new FileReader,b.onload=function(a){k(this.result)},b.readAsDataURL(a)}return!0}});
(function($){
    $.fn.extend({
        tableExport: function(options) {
            var defaults = {
                separator: ',',
                ignoreColumn: [],
                tableName:'yourTableName',
                type:'csv',
                pdfFontSize:14,
                pdfLeftMargin:20,
                escape:'true',
                htmlContent:'false',
                consoleLog:'false'
            };

            var options = $.extend(defaults, options);
            var el = this;

            if(defaults.type == 'csv' || defaults.type == 'txt'){

                // Header
                var tdData ="";
                $(el).find('thead').find('tr').each(function() {
                    tdData += "\n";
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"' + parseString($(this)) + '"' + defaults.separator;
                            }
                        }
                    });
                    tdData = $.trim(tdData);
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });

                // Row vs Column
                $(el).find('tbody').find('tr').each(function() {
                    tdData += "\n";
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"'+ parseString($(this)) + '"'+ defaults.separator;
                            }
                        }
                    });
                    //tdData = $.trim(tdData);
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });

                //output
                if(defaults.consoleLog == 'true'){
                    console.log(tdData);
                }
                var base64data = "base64," + $.base64.encode(tdData);
                //window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);
                download('data:text/plain;'+base64data,'download.'+defaults.type,'text/plain');
            }else if(defaults.type == 'sql'){

                // Header
                var tdData ="INSERT INTO `"+defaults.tableName+"` (";
                $(el).find('thead').find('tr').each(function() {

                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '`' + parseString($(this)) + '`,' ;
                            }
                        }
                    });
                    tdData = $.trim(tdData);
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });
                tdData += ") VALUES ";
                // Row vs Column
                $(el).find('tbody').find('tr').each(function() {
                    tdData += "(";
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"'+ parseString($(this)) + '",';
                            }
                        }
                    });

                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                    tdData += "),";
                });
                tdData = $.trim(tdData).substring(0, tdData.length -1);
                tdData += ";";

                //output
                //console.log(tdData);

                if(defaults.consoleLog == 'true'){
                    console.log(tdData);
                }

                var base64data = "base64," + $.base64.encode(tdData);
                //window.open('data:text/plain;filename=filename.sql;' + base64data);
                download('data:text/plain;'+base64data,'download.'+defaults.type,'text/plain');

            }else if(defaults.type == 'json'){

                var jsonHeaderArray = [];
                $(el).find('thead').find('tr').each(function() {
                    var tdData ="";
                    var jsonArrayTd = [];

                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                jsonArrayTd.push(parseString($(this)));
                            }
                        }
                    });
                    jsonHeaderArray.push(jsonArrayTd);

                });

                var jsonArray = [];
                $(el).find('tbody').find('tr').each(function() {
                    var tdData ="";
                    var jsonArrayTd = [];

                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                jsonArrayTd.push(parseString($(this)));
                            }
                        }
                    });
                    jsonArray.push(jsonArrayTd);

                });

                var jsonExportArray =[];
                jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});

                //Return as JSON
                //console.log(JSON.stringify(jsonExportArray));

                //Return as Array
                //console.log(jsonExportArray);
                if(defaults.consoleLog == 'true'){
                    console.log(JSON.stringify(jsonExportArray));
                }
                var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
                //window.open('data:application/json;filename=exportData;' + base64data);
                download('data:application/json;'+base64data,'download.'+defaults.type,'application/json');
            }else if(defaults.type == 'xml'){

                var xml = '<?xml version="1.0" encoding="utf-8"?>';
                xml += '<tabledata><fields>';

                // Header
                $(el).find('thead').find('tr').each(function() {
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                xml += "<field>" + parseString($(this)) + "</field>";
                            }
                        }
                    });
                });
                xml += '</fields><data>';

                // Row Vs Column
                var rowCount=1;
                $(el).find('tbody').find('tr').each(function() {
                    xml += '<row id="'+rowCount+'">';
                    var colCount=0;
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
                            }
                        }
                        colCount++;
                    });
                    rowCount++;
                    xml += '</row>';
                });
                xml += '</data></tabledata>'

                if(defaults.consoleLog == 'true'){
                    console.log(xml);
                }

                var base64data = "base64," + $.base64.encode(xml);
                //window.open('data:application/xml;filename=exportData;' + base64data);
                download('data:application/xml;'+base64data,'download.'+defaults.type,'application/xml');

            }else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){

                //console.log($(this).html());
                var excel="<table>";
                // Header
                $(el).find('thead').find('tr').each(function() {
                    excel += "<tr>";
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                excel += "<td>" + parseString($(this))+ "</td>";
                            }
                        }
                    });
                    excel += '</tr>';

                });

                // Row Vs Column
                var rowCount=1;
                $(el).find('tbody').find('tr').each(function() {
                    excel += "<tr>";
                    var colCount=0;
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                excel += "<td>"+parseString($(this))+"</td>";
                            }
                        }
                        colCount++;
                    });
                    rowCount++;
                    excel += '</tr>';
                });
                excel += '</table>'

                if(defaults.consoleLog == 'true'){
                    console.log(excel);
                }

                var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
                excelFile += "<head>";
                excelFile += "<!--[if gte mso 9]>";
                excelFile += "<xml>";
                excelFile += "<x:ExcelWorkbook>";
                excelFile += "<x:ExcelWorksheets>";
                excelFile += "<x:ExcelWorksheet>";
                excelFile += "<x:Name>";
                excelFile += "{worksheet}";
                excelFile += "</x:Name>";
                excelFile += "<x:WorksheetOptions>";
                excelFile += "<x:DisplayGridlines/>";
                excelFile += "</x:WorksheetOptions>";
                excelFile += "</x:ExcelWorksheet>";
                excelFile += "</x:ExcelWorksheets>";
                excelFile += "</x:ExcelWorkbook>";
                excelFile += "</xml>";
                excelFile += "<![endif]-->";
                excelFile += "</head>";
                excelFile += "<body>";
                excelFile += excel;
                excelFile += "</body>";
                excelFile += "</html>";

                var base64data = "base64," + $.base64.encode(excelFile);
                switch(defaults.type){
                    case 'excel':
                        //window.open('data:application/vnd.ms-'+defaults.type+';'+base64data);
                        download('data:text/plain;'+base64data,'download.xls','application/vnd.ms-'+defaults.type);
                        break;
                    case 'powerpoint':
                        window.open('data:application/vnd.ms-'+defaults.type+';'+base64data);
                        break;
                    case 'doc':
                        download('data:application/msword;'+base64data,'download.doc','application/msword');
                        break;
                }

            }else if(defaults.type == 'png'){
                html2canvas($(el), {
                    onrendered: function(canvas) {
                        var img = canvas.toDataURL("image/png");
                        window.open(img);
                    }
                });
            }else if(defaults.type == 'pdf'){

                var doc = new jsPDF('p','pt', 'a4', true);
                doc.setFontSize(defaults.pdfFontSize);

                // Header
                var startColPosition=defaults.pdfLeftMargin;
                $(el).find('thead').find('tr').each(function() {
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                var colPosition = startColPosition+ (index * 50);
                                doc.text(colPosition,20, parseString($(this)));
                            }
                        }
                    });
                });

                // Row Vs Column
                var startRowPosition = 20; var page =1;var rowPosition=0;
                $(el).find('tbody').find('tr').each(function(index,data) {
                    rowCalc = index+1;

                    if (rowCalc % 26 == 0){
                        doc.addPage();
                        page++;
                        startRowPosition=startRowPosition+10;
                    }
                    rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);

                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                var colPosition = startColPosition+ (index * 50);
                                doc.text(colPosition,rowPosition, parseString($(this)));
                            }
                        }

                    });

                });

                // Output as Data URI
                doc.output('datauri');

            }

            function parseString(data){

                if(defaults.htmlContent == 'true'){
                    content_data = data.html().trim();
                }else{
                    content_data = data.text().trim();
                }

                if(defaults.escape == 'true'){
                    content_data = escape(content_data);
                }

                return content_data;
            }

        }
    });
})(jQuery);