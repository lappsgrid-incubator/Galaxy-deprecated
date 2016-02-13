<<<<<<< HEAD
define(["utils/utils", "mvc/ui/ui-modal", "mvc/ui/ui-tabs", "mvc/upload/upload-button", "mvc/upload/default/default-view", "mvc/upload/composite/composite-view"], function (a, b, c, d, e, f) {
    return Backbone.View.extend({
        options: {
            nginx_upload_path: "",
            ftp_upload_site: "n/a",
            default_genome: "?",
            default_extension: "auto",
            height: 500,
            width: 900,
            auto: {
                id: "auto",
                text: "Auto-detect",
                description: "This system will try to detect the file type automatically. If your file is not detected properly as one of the known formats, it most likely means that it has some format problems (e.g., different number of columns on different rows). You can still coerce the system to set your data to the format you think it should be.  You can also upload compressed files, which will automatically be decompressed."
            }
        },
        modal: null,
        ui_button: null,
        current_history: null,
        list_extensions: [],
        list_genomes: [],
        initialize: function (b) {
            var c = this;
            this.options = a.merge(b, this.options), this.ui_button = new d.Model, this.ui_button_view = new d.View({
                model: this.ui_button,
                onclick: function (a) {
                    a.preventDefault(), c.show()
                },
                onunload: function () {
                    var a = c.ui_button.get("percentage", 0);
                    return a > 0 && 100 > a ? "Several uploads are queued." : void 0
                }
            }), this.setElement(this.ui_button_view.$el);
            var c = this;
            a.get({
                url: galaxy_config.root + "api/datatypes?extension_only=False", success: function (a) {
                    for (key in a)c.list_extensions.push({
                        id: a[key].extension,
                        text: a[key].extension,
                        description: a[key].description,
                        description_url: a[key].description_url,
                        composite_files: a[key].composite_files
                    });
                    c.list_extensions.sort(function (a, b) {
                        var c = a.text && a.text.toLowerCase(), d = b.text && b.text.toLowerCase();
                        return c > d ? 1 : d > c ? -1 : 0
                    }), c.options.datatypes_disable_auto || c.list_extensions.unshift(c.options.auto)
                }
            }), a.get({
                url: galaxy_config.root + "api/genomes", success: function (a) {
                    for (key in a)c.list_genomes.push({id: a[key][1], text: a[key][0]});
                    c.list_genomes.sort(function (a, b) {
                        return a.id == c.options.default_genome ? -1 : b.id == c.options.default_genome ? 1 : a.text > b.text ? 1 : a.text < b.text ? -1 : 0
                    })
                }
            })
        },
        show: function () {
            var a = this;
            return Galaxy.currHistoryPanel && Galaxy.currHistoryPanel.model ? (this.current_user = Galaxy.user.id, this.modal || (this.tabs = new c.View, this.default_view = new e(this), this.tabs.add({
                id: "regular",
                title: "Regular",
                $el: this.default_view.$el
            }), this.composite_view = new f(this), this.tabs.add({
                id: "composite",
                title: "Composite",
                $el: this.composite_view.$el
            }), this.modal = new b.View({
                title: "Download from web or upload from disk",
                body: this.tabs.$el,
                height: this.options.height,
                width: this.options.width,
                closing_events: !0,
                title_separator: !1
            })), void this.modal.show()) : void window.setTimeout(function () {
                a.show()
            }, 500)
        },
        currentHistory: function () {
            return this.current_user && Galaxy.currHistoryPanel.model.get("id")
        },
        currentFtp: function () {
            return this.current_user && this.options.ftp_upload_site
        },
        toData: function (a, b) {
            var c = {
                payload: {tool_id: "upload1", history_id: b || this.currentHistory(), inputs: {}},
                files: [],
                error_message: null
            };
            if (a && a.length > 0) {
                var d = {};
                d.dbkey = a[0].get("genome", null), d.file_type = a[0].get("extension", null);
                for (var e in a) {
                    var f = a[e];
                    if (f.set("status", "running"), !(f.get("file_size") > 0)) {
                        c.error_message = "Upload content incomplete.", f.set("status", "error"), f.set("info", c.error_message);
                        break
                    }
                    var g = "files_" + e + "|";
                    switch (d[g + "type"] = "upload_dataset", d[g + "space_to_tab"] = f.get("space_to_tab") && "Yes" || null, d[g + "to_posix_lines"] = f.get("to_posix_lines") && "Yes" || null, f.get("file_mode")) {
                        case"new":
                            d[g + "url_paste"] = f.get("url_paste");
                            break;
                        case"ftp":
                            d[g + "ftp_files"] = f.get("file_path");
                            break;
                        case"local":
                            c.files.push({name: g + "file_data", file: f.get("file_data")})
                    }
                }
                c.payload.inputs = JSON.stringify(d)
            }
            return c
        }
    })
});
=======
define(["utils/utils","mvc/ui/ui-modal","mvc/ui/ui-tabs","mvc/upload/upload-button","mvc/upload/default/default-view","mvc/upload/composite/composite-view"],function(a,b,c,d,e,f){return Backbone.View.extend({options:{nginx_upload_path:"",ftp_upload_site:"n/a",default_genome:"?",default_extension:"auto",height:500,width:900,auto:{id:"auto",text:"Auto-detect",description:"This system will try to detect the file type automatically. If your file is not detected properly as one of the known formats, it most likely means that it has some format problems (e.g., different number of columns on different rows). You can still coerce the system to set your data to the format you think it should be.  You can also upload compressed files, which will automatically be decompressed."}},modal:null,ui_button:null,current_history:null,list_extensions:[],list_genomes:[],initialize:function(b){var c=this;this.options=a.merge(b,this.options),this.ui_button=new d.Model,this.ui_button_view=new d.View({model:this.ui_button,onclick:function(a){a.preventDefault(),c.show()},onunload:function(){var a=c.ui_button.get("percentage",0);return a>0&&100>a?"Several uploads are queued.":void 0}}),this.setElement(this.ui_button_view.$el);var c=this;a.get({url:Galaxy.root+"api/datatypes?extension_only=False",success:function(a){for(key in a)c.list_extensions.push({id:a[key].extension,text:a[key].extension,description:a[key].description,description_url:a[key].description_url,composite_files:a[key].composite_files});c.list_extensions.sort(function(a,b){var c=a.text&&a.text.toLowerCase(),d=b.text&&b.text.toLowerCase();return c>d?1:d>c?-1:0}),c.options.datatypes_disable_auto||c.list_extensions.unshift(c.options.auto)}}),a.get({url:Galaxy.root+"api/genomes",success:function(a){for(key in a)c.list_genomes.push({id:a[key][1],text:a[key][0]});c.list_genomes.sort(function(a,b){return a.id==c.options.default_genome?-1:b.id==c.options.default_genome?1:a.text>b.text?1:a.text<b.text?-1:0})}})},show:function(){var a=this;return Galaxy.currHistoryPanel&&Galaxy.currHistoryPanel.model?(this.current_user=Galaxy.user.id,this.modal||(this.tabs=new c.View,this.default_view=new e(this),this.tabs.add({id:"regular",title:"Regular",$el:this.default_view.$el}),this.composite_view=new f(this),this.tabs.add({id:"composite",title:"Composite",$el:this.composite_view.$el}),this.modal=new b.View({title:"Download from web or upload from disk",body:this.tabs.$el,height:this.options.height,width:this.options.width,closing_events:!0,title_separator:!1})),void this.modal.show()):void window.setTimeout(function(){a.show()},500)},currentHistory:function(){return this.current_user&&Galaxy.currHistoryPanel.model.get("id")},currentFtp:function(){return this.current_user&&this.options.ftp_upload_site},toData:function(a,b){var c={payload:{tool_id:"upload1",history_id:b||this.currentHistory(),inputs:{}},files:[],error_message:null};if(a&&a.length>0){var d={};d.dbkey=a[0].get("genome",null),d.file_type=a[0].get("extension",null);for(var e in a){var f=a[e];if(f.set("status","running"),!(f.get("file_size")>0)){c.error_message="Upload content incomplete.",f.set("status","error"),f.set("info",c.error_message);break}var g="files_"+e+"|";switch(d[g+"type"]="upload_dataset",d[g+"space_to_tab"]=f.get("space_to_tab")&&"Yes"||null,d[g+"to_posix_lines"]=f.get("to_posix_lines")&&"Yes"||null,f.get("file_mode")){case"new":d[g+"url_paste"]=f.get("url_paste");break;case"ftp":d[g+"ftp_files"]=f.get("file_path");break;case"local":c.files.push({name:g+"file_data",file:f.get("file_data")})}}c.payload.inputs=JSON.stringify(d)}return c}})});
>>>>>>> 65d9ec9cab2b6e46fa7a067948bba69e3255c1ff
//# sourceMappingURL=../../../maps/mvc/upload/upload-view.js.map