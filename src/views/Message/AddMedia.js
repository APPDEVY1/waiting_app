/*globals define*/
define(function(require, exports, module) {

    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var ScrollView = require('famous/views/Scrollview');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var Surface = require('famous/core/Surface');
    var InputSurface = require('famous/surfaces/InputSurface');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable     = require('famous/transitions/Transitionable');
    var Transform = require('famous/core/Transform');
    var Matrix = require('famous/core/Transform');
    var RenderNode         = require('famous/core/RenderNode')

    var Utility = require('famous/utilities/Utility');

    var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
    var NavigationBar = require('famous/widgets/NavigationBar');
    var GridLayout = require("famous/views/GridLayout");

    // Extras
    var Credentials         = JSON.parse(require('text!credentials.json'));
    var $ = require('jquery');
    var Utils = require('utils');

    // Views
    var StandardHeader = require('views/common/StandardHeader');
    var FormHelper = require('views/common/FormHelper');
    var BoxLayout = require('famous-boxlayout');

    var EventHandler = require('famous/core/EventHandler');

    // Models
    var UserModel = require('models/user');


    function PageView(options) {
        var that = this;
        View.apply(this, arguments);
        this.options = options;

        // Models

        // User
        this.model = new UserModel.User();

        // create the layout
        this.layout = new HeaderFooterLayout({
            headerSize: App.Defaults.Header.size,
            footerSize: App.Defaults.Footer.size
        });

        if(!this.options.App.Cache.MediaOptions){
            window.location = '';
            // App.history.back();//.history.go(-1);
            return;
        }

        // Add to new ".passed" params, separate from this.options.App and other root-level arguments/objects
        this.options.passed = _.extend({}, App.Cache.MediaOptions || {});

        this.createHeader();
        this.createContent();

        this.add(this.layout);
    }

    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    PageView.prototype.createHeader = function(){
        var that = this;

        this.header = new StandardHeader({
            content: this.options.passed.title,
            classes: ["normal-header"],
            backClasses: ["normal-header"],
            moreContent: false
        }); 
        this.header._eventOutput.on('back',function(){
            // App.history.back();
            // App.history.back();
            that.options.passed.on_cancel();
        });
        this.header.navBar.title.on('click',function(){
            // App.history.back();
            // App.history.back();
            that.options.passed.on_cancel();
        });
        this._eventOutput.on('inOutTransition', function(args){
            this.header.inOutTransition.apply(that.header, args);
        })

        this.layout.header.add(Utils.usePlane('header')).add(this.header);

    };

    PageView.prototype.createContent = function(){
        var that = this;

        this.form = new FormHelper({
            type: 'form',
            scroll: true
        });

        // Add surfaces
        this.addSurfaces();
        
        // Content
        this.layout.content.StateModifier = new StateModifier();
        this.layout.content.add(this.layout.content.StateModifier).add(Utils.usePlane('content')).add(this.form);

    };

    PageView.prototype.addSurfaces = function() {
        var that = this;

        this.inputUsername = new FormHelper({

            margins: [10,10],

            form: this.form,
            name: 'username',
            placeholder: 'Username',
            type: 'text',
            value: ''
        });

        this.submitButton = new FormHelper({
            type: 'submit',
            value: 'Next',
            margins: [10,10],
            click: function(){
                that.options.passed.on_choose(null); //that.inputText.getValue());
            }
        });

        this.form.addInputsToForm([
            this.inputUsername,
            this.submitButton
        ]);

    };

    PageView.prototype.inOutTransition = function(direction, otherViewName, transitionOptions, delayShowing, otherView, goingBack){
        var that = this;

        this._eventOutput.emit('inOutTransition', arguments);

        switch(direction){
            case 'hiding':
                switch(otherViewName){

                    default:
                        // Overwriting and using default identity
                        transitionOptions.outTransform = Transform.identity;

                        // Content
                        window.setTimeout(function(){

                            // Opacity 0
                            that.layout.content.StateModifier.setOpacity(0, transitionOptions.inTransition);

                        }, delayShowing);

                        break;
                }

                break;
            case 'showing':
                if(this._refreshData){
                    // window.setTimeout(this.refreshData.bind(this), 1000);
                }
                this._refreshData = true;
                switch(otherViewName){

                    default:

                        // No animation by default
                        transitionOptions.inTransform = Transform.identity;

                        // // Default position
                        that.layout.content.StateModifier.setOpacity(0);

                        // Content
                        window.setTimeout(function(){

                            // Bring content back
                            that.layout.content.StateModifier.setOpacity(1, transitionOptions.inTransition);

                        }, delayShowing +transitionOptions.outTransition.duration);


                        break;
                }
                break;
        }
        
        return transitionOptions;
    };




    PageView.DEFAULT_OPTIONS = {
        header: {
            size: [undefined, 50]
        },
        footer: {
            size: [undefined, 0]
        },
        content: {
            size: [undefined, undefined]
        }
    };

    module.exports = PageView;

});
